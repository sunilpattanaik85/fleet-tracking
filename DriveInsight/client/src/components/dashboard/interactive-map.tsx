import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@shared/schema";

export default function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedCorridor, setSelectedCorridor] = useState("All Corridors");

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    refetchInterval: 30000,
  });

  const corridors = ["All Corridors", "North", "South", "East", "West"];
  const corridorColors = {
    North: "#0EA5E9", // dashboard-blue
    South: "#10B981", // green-500
    East: "#F59E0B",  // yellow-500
    West: "#8B5CF6",  // purple-500
  };

  const filteredVehicles = selectedCorridor === "All Corridors" 
    ? vehicles 
    : vehicles.filter(v => v.corridor === selectedCorridor);

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  if (isLoading) {
    return (
      <Card className="bg-dashboard-secondary border-dashboard-accent">
        <CardHeader>
          <CardTitle>Live Vehicle Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg bg-dashboard-accent flex items-center justify-center">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dashboard-secondary border-dashboard-accent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="map-title">Live Vehicle Tracking</CardTitle>
          <div className="flex items-center space-x-2">
            {corridors.map((corridor) => (
              <Button
                key={corridor}
                size="sm"
                variant={selectedCorridor === corridor ? "default" : "secondary"}
                onClick={() => setSelectedCorridor(corridor)}
                data-testid={`corridor-filter-${corridor.toLowerCase().replace(' ', '-')}`}
                className={
                  selectedCorridor === corridor
                    ? "bg-dashboard-blue text-primary-foreground"
                    : "bg-dashboard-accent text-muted-foreground hover:bg-dashboard-blue hover:text-primary-foreground"
                }
              >
                {corridor}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={mapRef}
          className="h-96 rounded-lg bg-dashboard-accent relative overflow-hidden"
          data-testid="vehicle-map"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-dashboard-accent bg-opacity-60"></div>
          
          {/* Vehicle markers */}
          <div className="absolute inset-0 p-4">
            {filteredVehicles.map((vehicle, index) => {
              const color = corridorColors[vehicle.corridor as keyof typeof corridorColors];
              const x = 20 + (index % 8) * 60; // Distribute markers horizontally
              const y = 20 + Math.floor(index / 8) * 50; // Stack vertically
              
              return (
                <div
                  key={vehicle.id}
                  className="absolute w-3 h-3 rounded-full animate-pulse cursor-pointer transform hover:scale-150 transition-transform"
                  style={{
                    backgroundColor: color,
                    left: `${x}px`,
                    top: `${y}px`,
                  }}
                  onClick={() => handleVehicleClick(vehicle)}
                  data-testid={`vehicle-marker-${vehicle.id}`}
                  title={`${vehicle.id} - ${vehicle.driverName} - Speed: ${vehicle.speed} km/h`}
                />
              );
            })}
          </div>
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <Button
              size="sm"
              className="w-8 h-8 bg-dashboard-secondary border border-dashboard-accent"
              data-testid="map-zoom-in"
            >
              +
            </Button>
            <Button
              size="sm"
              className="w-8 h-8 bg-dashboard-secondary border border-dashboard-accent"
              data-testid="map-zoom-out"
            >
              −
            </Button>
          </div>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-dashboard-secondary bg-opacity-90 rounded-lg p-3 text-xs">
            <div className="space-y-1">
              {Object.entries(corridorColors).map(([corridor, color]) => (
                <div key={corridor} className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span>{corridor} Corridor</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Vehicle Details Panel */}
        {selectedVehicle && (
          <div className="mt-4 bg-dashboard-accent rounded-lg p-4" data-testid="vehicle-details-panel">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Vehicle Details</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedVehicle(null)}
                data-testid="close-vehicle-details"
              >
                ×
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Vehicle ID</p>
                <p className="font-medium" data-testid="selected-vehicle-id">{selectedVehicle.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Driver</p>
                <p className="font-medium" data-testid="selected-vehicle-driver">{selectedVehicle.driverName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Current Speed</p>
                <p className="font-medium" data-testid="selected-vehicle-speed">{selectedVehicle.speed} km/h</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fuel Level</p>
                <p className="font-medium" data-testid="selected-vehicle-fuel">{selectedVehicle.fuel}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Corridor</p>
                <p className="font-medium" data-testid="selected-vehicle-corridor">{selectedVehicle.corridor}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p
                  className={`font-medium ${
                    selectedVehicle.status === "active" ? "text-green-600" : 
                    selectedVehicle.status === "idle" ? "text-yellow-600" : "text-red-600"
                  }`}
                  data-testid="selected-vehicle-status"
                >
                  {selectedVehicle.status}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}