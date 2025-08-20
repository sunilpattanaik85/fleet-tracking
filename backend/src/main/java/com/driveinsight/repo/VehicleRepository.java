package com.driveinsight.repo;

import com.driveinsight.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    List<Vehicle> findByCorridor(String corridor);
    List<Vehicle> findByStatus(String status);
}

