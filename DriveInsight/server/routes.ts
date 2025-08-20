import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, type WebSocket } from "ws";
import { storage } from "./storage";
import { insertVehicleSchema, insertRouteSchema, insertAlertSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server mounted on the same HTTP server, on path /ws
  const wss = new WebSocketServer({ noServer: true });
  const wsClients = new Set<WebSocket>();

  httpServer.on("upgrade", (request, socket, head) => {
    const url = request.url || "";
    if (!url.startsWith("/ws")) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws) => {
    wsClients.add(ws);
    ws.on("close", () => wsClients.delete(ws));
  });

  function broadcastVehicleUpdate(vehicle: any) {
    const message = JSON.stringify({ type: "vehicle_update", vehicleId: vehicle.id });
    for (const client of wsClients) {
      if (client.readyState === client.OPEN) {
        try {
          client.send(message);
        } catch {}
      }
    }
  }

  // Vehicle routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const validated = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validated);
      broadcastVehicleUpdate(vehicle);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ message: "Invalid vehicle data" });
    }
  });

  app.patch("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.updateVehicle(req.params.id, req.body);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      broadcastVehicleUpdate(vehicle);
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVehicle(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const stats = await storage.getSummaryStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch summary stats" });
    }
  });

  app.get("/api/analytics/corridors", async (req, res) => {
    try {
      const corridors = await storage.getCorridorDistribution();
      res.json(corridors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch corridor distribution" });
    }
  });

  app.get("/api/analytics/vehicle-types", async (req, res) => {
    try {
      const types = await storage.getVehicleTypeDistribution();
      res.json(types);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle types" });
    }
  });

  app.get("/api/analytics/fleet-status", async (req, res) => {
    try {
      const statuses = await storage.getFleetStatusDistribution();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fleet status" });
    }
  });

  // Alert routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const validated = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validated);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data" });
    }
  });

  // Route routes
  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await storage.getRoutes();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  app.get("/api/routes/vehicle/:vehicleId", async (req, res) => {
    try {
      const routes = await storage.getVehicleRoutes(req.params.vehicleId);
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle routes" });
    }
  });

  app.post("/api/routes", async (req, res) => {
    try {
      const validated = insertRouteSchema.parse(req.body);
      const route = await storage.createRoute(validated);
      res.status(201).json(route);
    } catch (error) {
      res.status(400).json({ message: "Invalid route data" });
    }
  });

  // Daily metrics routes
  app.get("/api/metrics/daily", async (req, res) => {
    try {
      const metrics = await storage.getDailyMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily metrics" });
    }
  });

  app.get("/api/metrics/daily/vehicle/:vehicleId", async (req, res) => {
    try {
      const metrics = await storage.getVehicleDailyMetrics(req.params.vehicleId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle metrics" });
    }
  });

  // Simulate real-time vehicle updates
  setInterval(() => {
    storage.getVehicles().then(vehicles => {
      vehicles.forEach(async (vehicle) => {
        if (vehicle.status === 'active') {
          // Simulate small position changes
          const latChange = (Math.random() - 0.5) * 0.001;
          const lngChange = (Math.random() - 0.5) * 0.001;
          const speedChange = (Math.random() - 0.5) * 5;
          
          const updatedVehicle = await storage.updateVehicle(vehicle.id, {
            latitude: vehicle.latitude + latChange,
            longitude: vehicle.longitude + lngChange,
            speed: Math.max(0, vehicle.speed + speedChange),
          });
          
          if (updatedVehicle) {
            broadcastVehicleUpdate(updatedVehicle);
          }
        }
      });
    });
  }, 10000); // Update every 10 seconds

  return httpServer;
}
