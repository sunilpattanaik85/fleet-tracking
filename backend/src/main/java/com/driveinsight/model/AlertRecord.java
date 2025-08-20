package com.driveinsight.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "alerts")
@Data
public class AlertRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_id")
    private String vehicleId;
    private String type; // low_fuel, maintenance, speeding, offline
    private String message;
    private String severity; // low, medium, high, critical
    @Column(name = "is_active")
    private boolean isActive;
    @Column(name = "created_at")
    private java.time.Instant createdAt;
}

