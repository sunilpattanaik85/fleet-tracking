INSERT INTO vehicles (id, driver_name, corridor, speed, fuel, status, vehicle_type, latitude, longitude) VALUES
('V-001', 'John Smith', 'Beira', 45, 78, 'active', 'truck', -15.7861, 35.0058),
('V-002', 'Sarah Johnson', 'Nacala', 41, 45, 'active', 'van', -13.9626, 33.7741),
('V-003', 'Mike Davis', 'Central (Dar es Salaam)', 0, 92, 'idle', 'truck', -11.4650, 34.0200),
('V-004', 'Lisa Chen', 'Durban', 52, 67, 'active', 'sedan', -15.7861, 35.0058),
('V-005', 'Robert Wilson', 'Beira', 0, 85, 'maintenance', 'truck', -13.9626, 33.7741);

-- Sample route for V-001
INSERT INTO routes (vehicle_id, start_location, end_location, distance, duration, avg_speed, stops)
VALUES ('V-001', 'Blantyre', 'Mozambique Border', 120.0, 180, 40.0, 3);

-- Route points for the inserted route id (assumes AUTO_INCREMENT starts at 1)
INSERT INTO route_points (route_id, latitude, longitude, sequence) VALUES
(1, -15.7861, 35.0058, 1),
(1, -16.0000, 35.1000, 2),
(1, -16.2000, 35.0500, 3);

INSERT INTO alerts (vehicle_id, type, message, severity, is_active) VALUES
('V-002', 'low_fuel', 'V-002 - 15% remaining', 'high', true),
('V-005', 'maintenance', 'V-005 - Service required', 'medium', true);

INSERT INTO daily_metrics (vehicle_id, total_distance, fuel_efficiency, avg_speed) VALUES
('V-001', 147, 16.8, 43),
('V-002', 89, 15.2, 39);

