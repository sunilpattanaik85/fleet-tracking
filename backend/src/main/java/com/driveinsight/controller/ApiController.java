package com.driveinsight.controller;

import com.driveinsight.model.*;
import com.driveinsight.repo.*;
import com.driveinsight.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5000"}, allowCredentials = "true")
public class ApiController {
    private final VehicleRepository vehicleRepository;
    private final RouteRecordRepository routeRepository;
    private final AlertRecordRepository alertRepository;
    private final DailyMetricsRecordRepository dailyMetricsRepository;
    private final AnalyticsService analyticsService;
    private final RoutePointRepository routePointRepository;

    public ApiController(VehicleRepository vehicleRepository,
                         RouteRecordRepository routeRepository,
                         AlertRecordRepository alertRepository,
                         DailyMetricsRecordRepository dailyMetricsRepository,
                         AnalyticsService analyticsService,
                         RoutePointRepository routePointRepository) {
        this.vehicleRepository = vehicleRepository;
        this.routeRepository = routeRepository;
        this.alertRepository = alertRepository;
        this.dailyMetricsRepository = dailyMetricsRepository;
        this.analyticsService = analyticsService;
        this.routePointRepository = routePointRepository;
    }

    // Vehicles CRUD
    @GetMapping("/vehicles")
    public List<Vehicle> getVehicles() { return vehicleRepository.findAll(); }

    @GetMapping("/vehicles/{id}")
    public ResponseEntity<Vehicle> getVehicle(@PathVariable String id) {
        return vehicleRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/vehicles")
    public Vehicle createVehicle(@RequestBody Vehicle vehicle) { return vehicleRepository.save(vehicle); }

    @PatchMapping("/vehicles/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable String id, @RequestBody Vehicle updates) {
        return vehicleRepository.findById(id).map(existing -> {
            if (updates.getDriverName() != null) existing.setDriverName(updates.getDriverName());
            if (updates.getCorridor() != null) existing.setCorridor(updates.getCorridor());
            if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
            if (updates.getVehicleType() != null) existing.setVehicleType(updates.getVehicleType());
            if (updates.getSpeed() != 0) existing.setSpeed(updates.getSpeed());
            if (updates.getFuel() != 0) existing.setFuel(updates.getFuel());
            if (updates.getLatitude() != 0) existing.setLatitude(updates.getLatitude());
            if (updates.getLongitude() != 0) existing.setLongitude(updates.getLongitude());
            return ResponseEntity.ok(vehicleRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable String id) {
        if (vehicleRepository.existsById(id)) {
            vehicleRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Alerts
    @GetMapping("/alerts")
    public List<AlertRecord> getAlerts() { return alertRepository.findByIsActiveTrue(); }

    @PostMapping("/alerts")
    public AlertRecord createAlert(@RequestBody AlertRecord alert) { return alertRepository.save(alert); }

    // Routes
    @GetMapping("/routes")
    public List<RouteRecord> getRoutes() { return routeRepository.findAll(); }

    @GetMapping("/routes/vehicle/{vehicleId}")
    public List<RouteRecord> getRoutesByVehicle(@PathVariable String vehicleId) { return routeRepository.findByVehicleId(vehicleId); }

    @PostMapping("/routes")
    public RouteRecord createRoute(@RequestBody RouteRecord route) { return routeRepository.save(route); }

    @GetMapping("/routes/{routeId}/points")
    public List<RoutePoint> getRoutePoints(@PathVariable Long routeId) {
        return routePointRepository.findByRouteIdOrderBySequenceAsc(routeId);
    }

    // Daily metrics
    @GetMapping("/metrics/daily")
    public List<DailyMetricsRecord> getDailyMetrics() { return dailyMetricsRepository.findAll(); }

    @GetMapping("/metrics/daily/vehicle/{vehicleId}")
    public List<DailyMetricsRecord> getDailyMetricsByVehicle(@PathVariable String vehicleId) { return dailyMetricsRepository.findByVehicleId(vehicleId); }

    // Analytics
    @GetMapping("/analytics/summary")
    public Map<String, Object> getSummary() { return analyticsService.getSummary(); }

    @GetMapping("/analytics/corridors")
    public List<Map<String, Object>> corridors() { return analyticsService.getCorridorDistribution(); }

    @GetMapping("/analytics/vehicle-types")
    public List<Map<String, Object>> vehicleTypes() { return analyticsService.getVehicleTypeDistribution(); }

    @GetMapping("/analytics/fleet-status")
    public List<Map<String, Object>> fleetStatus() { return analyticsService.getFleetStatusDistribution(); }
}

