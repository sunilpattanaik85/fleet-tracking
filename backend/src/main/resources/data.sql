INSERT INTO vehicles (id, driver_name, corridor, speed, fuel, status, vehicle_type, latitude, longitude) VALUES
('V-001', 'John Smith', 'Beira', 45, 78, 'active', 'truck', 40.7589, -73.9851),
('V-002', 'Sarah Johnson', 'Nacala', 41, 45, 'active', 'van', 40.7282, -74.0776),
('V-003', 'Mike Davis', 'Central (Dar es Salaam)', 0, 92, 'idle', 'truck', 40.7614, -73.9776),
('V-004', 'Lisa Chen', 'Durban', 52, 67, 'active', 'sedan', 40.7505, -73.9934),
('V-005', 'Robert Wilson', 'Beira', 0, 85, 'maintenance', 'truck', 40.7831, -73.9712);

INSERT INTO alerts (vehicle_id, type, message, severity, is_active) VALUES
('V-002', 'low_fuel', 'V-002 - 15% remaining', 'high', true),
('V-005', 'maintenance', 'V-005 - Service required', 'medium', true);

INSERT INTO daily_metrics (vehicle_id, total_distance, fuel_efficiency, avg_speed) VALUES
('V-001', 147, 16.8, 43),
('V-002', 89, 15.2, 39);

