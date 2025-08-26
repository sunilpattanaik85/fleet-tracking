package com.driveinsight.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "vehicles")
@Data
public class Vehicle {
    @Id
    private String id;
    @Column(name = "driver_name")
    private String driverName;
    private String corridor; // North, South, East, West
    private double speed;
    private int fuel; // percentage
    private String status; // active, idle, maintenance, offline
    @Column(name = "vehicle_type")
    private String vehicleType; // truck, van, sedan
    private double latitude;
    private double longitude;
    @Column(name = "last_update")
    private java.time.Instant lastUpdate;
}

