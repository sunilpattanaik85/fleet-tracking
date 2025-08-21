package com.driveinsight.config;

import com.driveinsight.model.Vehicle;
import com.driveinsight.repo.VehicleRepository;
import com.driveinsight.ws.VehicleWebSocketHandler;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@EnableScheduling
public class SchedulingConfig {
    private final VehicleRepository vehicleRepository;
    private final VehicleWebSocketHandler ws;

    public SchedulingConfig(VehicleRepository vehicleRepository, VehicleWebSocketHandler ws) {
        this.vehicleRepository = vehicleRepository;
        this.ws = ws;
    }

    @Scheduled(fixedDelay = 10000)
    public void simulateLiveUpdates() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        vehicles.stream().filter(v -> "active".equalsIgnoreCase(v.getStatus())).findAny().ifPresent(v -> {
            v.setSpeed(Math.max(0, v.getSpeed() + (Math.random() - 0.5) * 5));
            v.setLatitude(v.getLatitude() + (Math.random() - 0.5) * 0.01);
            v.setLongitude(v.getLongitude() + (Math.random() - 0.5) * 0.01);
            vehicleRepository.save(v);
            ws.broadcast("{\"type\":\"vehicle_update\",\"vehicleId\":\"" + v.getId() + "\"}");
        });
    }
}

