package com.driveinsight.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "route_points")
@Data
public class RoutePoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "route_id")
    private Long routeId;

    private double latitude;
    private double longitude;

    // simple sequencing to preserve path order
    private int sequence;
}