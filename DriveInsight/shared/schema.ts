import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey(),
  driverName: text("driver_name").notNull(),
  corridor: text("corridor").notNull(), // North, South, East, West
  speed: real("speed").notNull().default(0),
  fuel: integer("fuel").notNull().default(100), // percentage
  status: text("status").notNull().default("active"), // active, idle, maintenance, offline
  vehicleType: text("vehicle_type").notNull(), // truck, van, sedan
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  lastUpdate: timestamp("last_update").defaultNow(),
});

export const routes = pgTable("routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id).notNull(),
  startLocation: text("start_location").notNull(),
  endLocation: text("end_location").notNull(),
  distance: real("distance").notNull(), // in km
  duration: integer("duration").notNull(), // in minutes
  avgSpeed: real("avg_speed").notNull(),
  stops: integer("stops").notNull().default(0),
  date: timestamp("date").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id).notNull(),
  type: text("type").notNull(), // low_fuel, maintenance, speeding, offline
  message: text("message").notNull(),
  severity: text("severity").notNull(), // low, medium, high, critical
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyMetrics = pgTable("daily_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id).notNull(),
  date: timestamp("date").defaultNow(),
  totalDistance: real("total_distance").notNull().default(0),
  fuelEfficiency: real("fuel_efficiency").notNull().default(0), // km/L
  avgSpeed: real("avg_speed").notNull().default(0),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  lastUpdate: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  date: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertDailyMetricsSchema = createInsertSchema(dailyMetrics).omit({
  id: true,
  date: true,
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type DailyMetrics = typeof dailyMetrics.$inferSelect;
export type InsertDailyMetrics = z.infer<typeof insertDailyMetricsSchema>;
