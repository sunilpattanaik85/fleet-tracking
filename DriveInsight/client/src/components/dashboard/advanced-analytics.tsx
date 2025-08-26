import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AlertTriangle, Wrench, Gauge, WifiOff } from "lucide-react";
import type { Alert, Vehicle, Route } from "@shared/schema";

export default function AdvancedAnalytics() {
  const { data: vehicleTypes = [], isLoading: typesLoading } = useQuery<{ type: string; count: number }[]>({
    queryKey: ["/api/analytics/vehicle-types"],
    refetchInterval: 30000,
  });

  const { data: fleetStatus = [], isLoading: statusLoading } = useQuery<{ status: string; count: number }[]>({
    queryKey: ["/api/analytics/fleet-status"],
    refetchInterval: 30000,
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 30000,
  });

  // Vehicles and routes for Route Analysis
  const { data: vehicles = [] } = useQuery<Vehicle[]>({ queryKey: ["/api/vehicles"], refetchInterval: 30000 });
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const { data: routes = [] } = useQuery<Route[]>({
    queryKey: ["/api/routes"],
    refetchInterval: 30000,
  });

  const vehicleRoutes = useMemo(() => {
    return selectedVehicleId ? routes.filter(r => r.vehicleId === selectedVehicleId) : [];
  }, [routes, selectedVehicleId]);

  const latestRoute = vehicleRoutes[0];

  const typeColors = ["#0EA5E9", "#10B981", "#F59E0B"];
  const statusColors = ["#10B981", "#6B7280", "#F97316", "#EF4444"];

  const vehicleTypeData = vehicleTypes.map((item, index) => ({
    ...item,
    color: typeColors[index % typeColors.length],
  }));

  const fleetStatusData = fleetStatus.map((item, index) => ({
    ...item,
    color: statusColors[index % statusColors.length],
  }));

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "low_fuel":
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case "maintenance":
        return <Wrench className="h-4 w-4 text-yellow-400" />;
      case "speeding":
        return <Gauge className="h-4 w-4 text-orange-400" />;
      case "offline":
        return <WifiOff className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "low_fuel":
        return "bg-red-500 bg-opacity-20";
      case "maintenance":
        return "bg-yellow-500 bg-opacity-20";
      case "speeding":
        return "bg-orange-500 bg-opacity-20";
      case "offline":
        return "bg-gray-500 bg-opacity-20";
      default:
        return "bg-red-500 bg-opacity-20";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Vehicle Type Distribution */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle data-testid="vehicle-types-title">Vehicle Types</CardTitle>
        </CardHeader>
        <CardContent>
          {typesLoading ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={50}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {vehicleTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {vehicleTypes.map((item, index) => (
                  <div
                    key={item.type}
                    className="flex items-center justify-between"
                    data-testid={`vehicle-type-${item.type}`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: typeColors[index % typeColors.length] }}
                      />
                      <span className="capitalize">{item.type}s</span>
                    </div>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Alert System */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle data-testid="alerts-title">Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${getAlertColor(alert.type)}`}
                  data-testid={`alert-${alert.type}-${alert.vehicleId}`}
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {alert.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Alert
                    </p>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center py-8" data-testid="no-alerts-message">
                  <p className="text-muted-foreground">No active alerts</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fleet Utilization */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle data-testid="fleet-status-title">Fleet Status</CardTitle>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fleetStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={50}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {fleetStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {fleetStatus.map((item, index) => {
                  const total = fleetStatus.reduce((sum, status) => sum + status.count, 0);
                  const percentage = Math.round((item.count / total) * 100);
                  
                  return (
                    <div
                      key={item.status}
                      className="flex items-center justify-between"
                      data-testid={`fleet-status-${item.status}`}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: statusColors[index % statusColors.length] }}
                        />
                        <span className="capitalize">{item.status}</span>
                      </div>
                      <span>{item.count} ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Route Visualization */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle data-testid="route-analysis-title">Route Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
              <SelectTrigger className="w-full" data-testid="route-vehicle-select">
                <SelectValue placeholder="Select Vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.id} - {v.driverName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="space-y-3">
              <div className="p-3 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground">Today's Route</p>
                <p className="font-semibold" data-testid="route-description">
                  {latestRoute ? `${latestRoute.startLocation} → ${latestRoute.endLocation}` : "No route available"}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div data-testid="route-distance">
                  <p className="text-muted-foreground">Distance</p>
                  <p className="font-semibold">{latestRoute ? `${Math.round(latestRoute.distance)} km` : "--"}</p>
                </div>
                <div data-testid="route-duration">
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-semibold">{latestRoute ? `${Math.round(latestRoute.duration / 60)}h ${latestRoute.duration % 60}m` : "--"}</p>
                </div>
                <div data-testid="route-avg-speed">
                  <p className="text-muted-foreground">Avg Speed</p>
                  <p className="font-semibold">{latestRoute ? `${Math.round(latestRoute.avgSpeed)} km/h` : "--"}</p>
                </div>
                <div data-testid="route-stops">
                  <p className="text-muted-foreground">Stops</p>
                  <p className="font-semibold">{latestRoute ? `${latestRoute.stops}` : "--"}</p>
                </div>
              </div>
              
              <Button 
                className="w-full bg-dashboard-blue hover:bg-blue-600 text-white py-2 rounded-lg text-sm transition-colors"
                data-testid="view-full-route-button"
                disabled={!latestRoute}
              >
                View Full Route
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
