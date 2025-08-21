package com.driveinsight.repo;

import com.driveinsight.model.RouteRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteRecordRepository extends JpaRepository<RouteRecord, Long> {
    List<RouteRecord> findByVehicleId(String vehicleId);
}

