package com.driveinsight.service;

import com.driveinsight.model.Vehicle;
import com.driveinsight.repo.VehicleRepository;
import com.driveinsight.ws.VehicleWebSocketHandler;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
@EnableScheduling
public class VehicleUpdateBroadcaster {
    private final VehicleRepository vehicleRepository;
    private final VehicleWebSocketHandler wsHandler;
    private final Random random = new Random();

    public VehicleUpdateBroadcaster(VehicleRepository vehicleRepository, VehicleWebSocketHandler wsHandler) {
        this.vehicleRepository = vehicleRepository;
        this.wsHandler = wsHandler;
    }

    @Scheduled(fixedRate = 10000)
    public void simulateAndBroadcast() {
        vehicleRepository.findAll().forEach(v -> {
            if ("active".equalsIgnoreCase(v.getStatus())) {
                double latChange = (random.nextDouble() - 0.5) * 0.001;
                double lngChange = (random.nextDouble() - 0.5) * 0.001;
                double speedChange = (random.nextDouble() - 0.5) * 5;
                v.setLatitude(v.getLatitude() + latChange);
                v.setLongitude(v.getLongitude() + lngChange);
                v.setSpeed(Math.max(0, v.getSpeed() + speedChange));
                vehicleRepository.save(v);
                wsHandler.broadcast("{\"type\":\"vehicle_update\",\"vehicleId\":\"" + v.getId() + "\"}");
            }
        });
    }

    public record VehicleUpdate(String vehicleId) {}
}

