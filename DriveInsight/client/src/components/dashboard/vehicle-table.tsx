import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Vehicle } from "@shared/schema";

export default function VehicleTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [corridorFilter, setCorridorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driverName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCorridor = corridorFilter === "all" || vehicle.corridor === corridorFilter;
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
    const matchesType = typeFilter === "all" || vehicle.vehicleType === typeFilter;

    return matchesSearch && matchesCorridor && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      idle: "secondary", 
      maintenance: "outline",
      offline: "destructive",
    };

    const colors: Record<string, string> = {
      active: "bg-green-500 bg-opacity-20 text-green-400",
      idle: "bg-gray-500 bg-opacity-20 text-gray-400",
      maintenance: "bg-orange-500 bg-opacity-20 text-orange-400",
      offline: "bg-red-500 bg-opacity-20 text-red-400",
    };

    return (
      <Badge 
        variant={variants[status] || "default"}
        className={colors[status]}
        data-testid={`status-badge-${status}`}
      >
        {status}
      </Badge>
    );
  };

  const getFuelBar = (fuel: number) => {
    const color = fuel > 50 ? "bg-green-500" : fuel > 25 ? "bg-yellow-500" : "bg-red-500";
    return (
      <div className="flex items-center space-x-2">
        <div className="w-16 bg-dashboard-accent rounded-full h-2">
          <div
            className={`h-2 rounded-full ${color}`}
            style={{ width: `${fuel}%` }}
          />
        </div>
        <span className="text-xs">{fuel}%</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-dashboard-secondary border-dashboard-accent">
        <CardHeader>
          <CardTitle>Vehicle Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-400">Loading vehicles...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dashboard-secondary border-dashboard-accent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="vehicle-table-title">Vehicle Details</CardTitle>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm">
              <Checkbox
                checked={autoRefresh}
                onCheckedChange={(checked) => setAutoRefresh(checked as boolean)}
                data-testid="auto-refresh-checkbox"
              />
              <span>Auto-refresh (30s)</span>
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <Input
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48 bg-dashboard-accent border-0"
            data-testid="vehicle-search-input"
          />
          <Select value={corridorFilter} onValueChange={setCorridorFilter}>
            <SelectTrigger className="w-32 bg-dashboard-accent border-0" data-testid="corridor-filter">
              <SelectValue placeholder="Corridor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Corridors</SelectItem>
              <SelectItem value="Beira">Beira</SelectItem>
              <SelectItem value="Nacala">Nacala</SelectItem>
              <SelectItem value="Central (Dar es Salaam)">Central (Dar es Salaam)</SelectItem>
              <SelectItem value="Durban">Durban</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-dashboard-accent border-0" data-testid="status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32 bg-dashboard-accent border-0" data-testid="type-filter">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="sedan">Sedan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-dashboard-accent">
                <TableHead className="text-gray-400">Vehicle ID</TableHead>
                <TableHead className="text-gray-400">Driver</TableHead>
                <TableHead className="text-gray-400">Corridor</TableHead>
                <TableHead className="text-gray-400">Speed</TableHead>
                <TableHead className="text-gray-400">Fuel</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow
                  key={vehicle.id}
                  className="border-b border-dashboard-accent hover:bg-dashboard-accent hover:bg-opacity-50 transition-colors"
                  data-testid={`vehicle-row-${vehicle.id}`}
                >
                  <TableCell className="font-medium text-dashboard-blue">
                    {vehicle.id}
                  </TableCell>
                  <TableCell>{vehicle.driverName}</TableCell>
                  <TableCell>{vehicle.corridor}</TableCell>
                  <TableCell>
                    {vehicle.status === "active" ? `${vehicle.speed} km/h` : "--"}
                  </TableCell>
                  <TableCell>{getFuelBar(vehicle.fuel)}</TableCell>
                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-8" data-testid="no-vehicles-message">
            <p className="text-gray-400">
              {searchTerm || corridorFilter !== "all" || statusFilter !== "all" || typeFilter !== "all"
                ? "No vehicles match the current filters"
                : "No vehicles available"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
