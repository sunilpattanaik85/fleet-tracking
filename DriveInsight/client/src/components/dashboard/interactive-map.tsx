import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@shared/schema";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function InteractiveMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
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

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    // Malawi bounds (approx): SW [-17.2, 32.6], NE [-9.2, 35.95]
    const malawiBounds = L.latLngBounds([
      [-17.2, 32.6],
      [-9.2, 35.95],
    ]);

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      maxBounds: malawiBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 6,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Start focused on Malawi
    map.fitBounds(malawiBounds.pad(0.05));

    // Add custom zoom controls to match UI buttons
    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // Sync markers with vehicles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const corridorColorByName: Record<string, string> = corridorColors as any;

    const currentMarkers = markersRef.current;
    const stillPresent = new Set<string>();

    filteredVehicles.forEach((v) => {
      stillPresent.add(v.id);
      const color = corridorColorByName[v.corridor] || "#0EA5E9";
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:12px;height:12px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.2)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      if (currentMarkers[v.id]) {
        currentMarkers[v.id].setLatLng([v.latitude, v.longitude]);
      } else {
        const m = L.marker([v.latitude, v.longitude], { icon })
          .addTo(map)
          .on("click", () => handleVehicleClick(v));
        m.bindPopup(
          `<div style="min-width:160px">
            <div><strong>${v.id}</strong></div>
            <div>Driver: ${v.driverName}</div>
            <div>Speed: ${v.speed} km/h</div>
            <div>Fuel: ${v.fuel}%</div>
          </div>`
        );
        currentMarkers[v.id] = m;
      }
    });

    // Remove markers for vehicles no longer present
    Object.keys(currentMarkers).forEach((id) => {
      if (!stillPresent.has(id)) {
        currentMarkers[id].remove();
        delete currentMarkers[id];
      }
    });

    // Fit bounds to visible markers when data first loads
    const markerList = Object.values(currentMarkers);
    if (markerList.length > 0) {
      const group = L.featureGroup(markerList);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  }, [filteredVehicles]);

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
          ref={mapContainerRef}
          className="h-96 rounded-lg overflow-hidden"
          data-testid="vehicle-map"
        />
        
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