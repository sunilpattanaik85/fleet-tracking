package com.driveinsight.service;

import com.driveinsight.model.DailyMetricsRecord;
import com.driveinsight.model.Vehicle;
import com.driveinsight.repo.DailyMetricsRecordRepository;
import com.driveinsight.repo.VehicleRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class AnalyticsService {
    private final VehicleRepository vehicleRepository;
    private final DailyMetricsRecordRepository dailyMetricsRepository;

    public AnalyticsService(VehicleRepository vehicleRepository, DailyMetricsRecordRepository dailyMetricsRepository) {
        this.vehicleRepository = vehicleRepository;
        this.dailyMetricsRepository = dailyMetricsRepository;
    }

    public Map<String, Object> getSummary() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        long activeVehicles = vehicles.stream().filter(v -> "active".equalsIgnoreCase(v.getStatus())).count();
        double avgSpeed = vehicles.stream().mapToDouble(Vehicle::getSpeed).average().orElse(0);
        long activeCorridors = vehicles.stream().map(Vehicle::getCorridor).distinct().count();

        Instant startOfDay = Instant.now().truncatedTo(java.time.temporal.ChronoUnit.DAYS);

        double totalDistanceToday = dailyMetricsRepository.findAll().stream()
                .filter(m -> m.getDate() != null && m.getDate().isAfter(startOfDay))
                .mapToDouble(DailyMetricsRecord::getTotalDistance)
                .sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalVehicles", vehicles.size());
        summary.put("activeVehicles", (int) activeVehicles);
        summary.put("avgSpeed", Math.round(avgSpeed * 10.0) / 10.0);
        summary.put("totalDistanceToday", Math.round(totalDistanceToday));
        summary.put("activeCorridors", (int) activeCorridors);
        return summary;
    }

    public List<Map<String, Object>> getCorridorDistribution() {
        Map<String, Long> counts = new LinkedHashMap<>();
        vehicleRepository.findAll().forEach(v -> counts.merge(v.getCorridor(), 1L, Long::sum));
        List<Map<String, Object>> result = new ArrayList<>();
        counts.forEach((corridor, count) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("corridor", corridor);
            m.put("count", count.intValue());
            result.add(m);
        });
        return result;
    }

    public List<Map<String, Object>> getVehicleTypeDistribution() {
        Map<String, Long> counts = new LinkedHashMap<>();
        vehicleRepository.findAll().forEach(v -> counts.merge(v.getVehicleType(), 1L, Long::sum));
        List<Map<String, Object>> result = new ArrayList<>();
        counts.forEach((type, count) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("type", type);
            m.put("count", count.intValue());
            result.add(m);
        });
        return result;
    }

    public List<Map<String, Object>> getFleetStatusDistribution() {
        Map<String, Long> counts = new LinkedHashMap<>();
        vehicleRepository.findAll().forEach(v -> counts.merge(v.getStatus(), 1L, Long::sum));
        List<Map<String, Object>> result = new ArrayList<>();
        counts.forEach((status, count) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("status", status);
            m.put("count", count.intValue());
            result.add(m);
        });
        return result;
    }
}

