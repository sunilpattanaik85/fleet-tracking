package com.driveinsight.repo;

import com.driveinsight.model.DailyMetricsRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DailyMetricsRecordRepository extends JpaRepository<DailyMetricsRecord, Long> {
    List<DailyMetricsRecord> findByVehicleId(String vehicleId);
}

