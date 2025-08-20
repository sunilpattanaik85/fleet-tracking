package com.driveinsight.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "daily_metrics")
@Data
public class DailyMetricsRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_id")
    private String vehicleId;
    private java.time.Instant date;
    @Column(name = "total_distance")
    private double totalDistance;
    @Column(name = "fuel_efficiency")
    private double fuelEfficiency; // km/L
    @Column(name = "avg_speed")
    private double avgSpeed;
}

