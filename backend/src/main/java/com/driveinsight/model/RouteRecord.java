package com.driveinsight.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "routes")
@Data
public class RouteRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_id")
    private String vehicleId;
    @Column(name = "start_location")
    private String startLocation;
    @Column(name = "end_location")
    private String endLocation;
    private double distance; // km
    private int duration; // minutes
    @Column(name = "avg_speed")
    private double avgSpeed;
    private int stops;
    private java.time.Instant date;
}

