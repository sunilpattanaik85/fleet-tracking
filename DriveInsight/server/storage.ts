import {
  type Vehicle,
  type InsertVehicle,
  type Route,
  type InsertRoute,
  type Alert,
  type InsertAlert,
  type DailyMetrics,
  type InsertDailyMetrics,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Vehicle operations
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;

  // Route operations
  getRoutes(): Promise<Route[]>;
  getVehicleRoutes(vehicleId: string): Promise<Route[]>;
  createRoute(route: InsertRoute): Promise<Route>;

  // Alert operations
  getActiveAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, alert: Partial<Alert>): Promise<Alert | undefined>;

  // Daily metrics operations
  getDailyMetrics(): Promise<DailyMetrics[]>;
  getVehicleDailyMetrics(vehicleId: string): Promise<DailyMetrics[]>;
  createDailyMetrics(metrics: InsertDailyMetrics): Promise<DailyMetrics>;

  // Dashboard analytics
  getSummaryStats(): Promise<{
    totalVehicles: number;
    activeVehicles: number;
    avgSpeed: number;
    totalDistanceToday: number;
    activeCorridors: number;
  }>;

  getCorridorDistribution(): Promise<{ corridor: string; count: number }[]>;
  getVehicleTypeDistribution(): Promise<{ type: string; count: number }[]>;
  getFleetStatusDistribution(): Promise<{ status: string; count: number }[]>;
}

export class MemStorage implements IStorage {
  private vehicles: Map<string, Vehicle> = new Map();
  private routes: Map<string, Route> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private dailyMetrics: Map<string, DailyMetrics> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed vehicles
    const seedVehicles: Vehicle[] = [
      {
        id: "V-001",
        driverName: "John Smith",
        corridor: "North",
        speed: 45,
        fuel: 78,
        status: "active",
        vehicleType: "truck",
        latitude: 40.7589,
        longitude: -73.9851,
        lastUpdate: new Date(),
      },
      {
        id: "V-002",
        driverName: "Sarah Johnson",
        corridor: "South",
        speed: 41,
        fuel: 45,
        status: "active",
        vehicleType: "van",
        latitude: 40.7282,
        longitude: -74.0776,
        lastUpdate: new Date(),
      },
      {
        id: "V-003",
        driverName: "Mike Davis",
        corridor: "East",
        speed: 0,
        fuel: 92,
        status: "idle",
        vehicleType: "truck",
        latitude: 40.7614,
        longitude: -73.9776,
        lastUpdate: new Date(),
      },
      {
        id: "V-004",
        driverName: "Lisa Chen",
        corridor: "West",
        speed: 52,
        fuel: 67,
        status: "active",
        vehicleType: "sedan",
        latitude: 40.7505,
        longitude: -73.9934,
        lastUpdate: new Date(),
      },
      {
        id: "V-005",
        driverName: "Robert Wilson",
        corridor: "North",
        speed: 0,
        fuel: 85,
        status: "maintenance",
        vehicleType: "truck",
        latitude: 40.7831,
        longitude: -73.9712,
        lastUpdate: new Date(),
      },
    ];

    seedVehicles.forEach(vehicle => {
      this.vehicles.set(vehicle.id, vehicle);
    });

    // Seed alerts
    const seedAlerts: Alert[] = [
      {
        id: randomUUID(),
        vehicleId: "V-002",
        type: "low_fuel",
        message: "V-002 - 15% remaining",
        severity: "high",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        vehicleId: "V-005",
        type: "maintenance",
        message: "V-005 - Service required",
        severity: "medium",
        isActive: true,
        createdAt: new Date(),
      },
    ];

    seedAlerts.forEach(alert => {
      this.alerts.set(alert.id, alert);
    });

    // Seed daily metrics
    const seedMetrics: DailyMetrics[] = [
      {
        id: randomUUID(),
        vehicleId: "V-001",
        date: new Date(),
        totalDistance: 147,
        fuelEfficiency: 16.8,
        avgSpeed: 43,
      },
      {
        id: randomUUID(),
        vehicleId: "V-002",
        date: new Date(),
        totalDistance: 89,
        fuelEfficiency: 15.2,
        avgSpeed: 39,
      },
    ];

    seedMetrics.forEach(metric => {
      this.dailyMetrics.set(metric.id, metric);
    });
  }

  // Vehicle operations
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const newVehicle: Vehicle = {
      ...vehicle,
      lastUpdate: new Date(),
    };
    this.vehicles.set(vehicle.id, newVehicle);
    return newVehicle;
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;

    const updatedVehicle = {
      ...vehicle,
      ...updates,
      lastUpdate: new Date(),
    };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  // Route operations
  async getRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async getVehicleRoutes(vehicleId: string): Promise<Route[]> {
    return Array.from(this.routes.values()).filter(route => route.vehicleId === vehicleId);
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const newRoute: Route = {
      ...route,
      id: randomUUID(),
      date: new Date(),
    };
    this.routes.set(newRoute.id, newRoute);
    return newRoute;
  }

  // Alert operations
  async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(alert => alert.isActive);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const newAlert: Alert = {
      ...alert,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.alerts.set(newAlert.id, newAlert);
    return newAlert;
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;

    const updatedAlert = { ...alert, ...updates };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // Daily metrics operations
  async getDailyMetrics(): Promise<DailyMetrics[]> {
    return Array.from(this.dailyMetrics.values());
  }

  async getVehicleDailyMetrics(vehicleId: string): Promise<DailyMetrics[]> {
    return Array.from(this.dailyMetrics.values()).filter(metric => metric.vehicleId === vehicleId);
  }

  async createDailyMetrics(metrics: InsertDailyMetrics): Promise<DailyMetrics> {
    const newMetrics: DailyMetrics = {
      ...metrics,
      id: randomUUID(),
      date: new Date(),
    };
    this.dailyMetrics.set(newMetrics.id, newMetrics);
    return newMetrics;
  }

  // Dashboard analytics
  async getSummaryStats() {
    const vehicles = Array.from(this.vehicles.values());
    const activeVehicles = vehicles.filter(v => v.status === "active");
    const corridors = new Set(vehicles.map(v => v.corridor));
    const avgSpeed = vehicles.reduce((sum, v) => sum + v.speed, 0) / vehicles.length;
    
    const todayMetrics = Array.from(this.dailyMetrics.values()).filter(m => {
      const today = new Date();
      return m.date && m.date.toDateString() === today.toDateString();
    });
    
    const totalDistanceToday = todayMetrics.reduce((sum, m) => sum + m.totalDistance, 0);

    return {
      totalVehicles: vehicles.length,
      activeVehicles: activeVehicles.length,
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      totalDistanceToday: Math.round(totalDistanceToday),
      activeCorridors: corridors.size,
    };
  }

  async getCorridorDistribution() {
    const vehicles = Array.from(this.vehicles.values());
    const corridors = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.corridor] = (acc[vehicle.corridor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(corridors).map(([corridor, count]) => ({
      corridor,
      count: count as number,
    }));
  }

  async getVehicleTypeDistribution() {
    const vehicles = Array.from(this.vehicles.values());
    const types = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.vehicleType] = (acc[vehicle.vehicleType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(types).map(([type, count]) => ({
      type,
      count: count as number,
    }));
  }

  async getFleetStatusDistribution() {
    const vehicles = Array.from(this.vehicles.values());
    const statuses = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statuses).map(([status, count]) => ({
      status,
      count: count as number,
    }));
  }
}

export const storage = new MemStorage();
