DriveInsight - Analytic Vehicle Tracking Dashboard

This repository contains the React frontend (DriveInsight) and a Spring Boot backend with MySQL for an Analytic Vehicle Tracking Dashboard.

Prerequisites

Node.js 18+
Java 17+
Maven 3.9+
MySQL 8+
Database Setup

Create database and user:
CREATE DATABASE driveinsight;
CREATE USER 'drive'@'localhost' IDENTIFIED BY 'drivepass';
GRANT ALL PRIVILEGES ON driveinsight.* TO 'drive'@'localhost';
FLUSH PRIVILEGES;
The backend runs schema.sql and data.sql automatically. If not, run them manually against driveinsight.
Backend (Spring Boot)

cd backend
mvn spring-boot:run
Runs on http://localhost:8080
REST API under /api/*
WebSocket STOMP endpoint at /ws (proxied by frontend).
Frontend (React + Vite)

cd DriveInsight
npm install
npm run dev
Opens on http://localhost:5000
Vite proxies API /api and /ws to the Spring Boot backend.
Key Endpoints

GET /api/vehicles, /api/vehicles/{id}
POST /api/vehicles, PATCH /api/vehicles/{id}, DELETE /api/vehicles/{id}
GET /api/analytics/summary, /api/analytics/corridors, /api/analytics/vehicle-types, /api/analytics/fleet-status
GET /api/metrics/daily, /api/metrics/daily/vehicle/{vehicleId}
GET /api/alerts, POST /api/alerts
GET /api/routes, /api/routes/vehicle/{vehicleId}, POST /api/routes
Notes

The React app implements the required UI and fetches from /api/* paths.
WebSocket live updates can be sent from Spring to /topic channels if you adopt STOMP on the client.# fleet-tracking
fleet-tracking
