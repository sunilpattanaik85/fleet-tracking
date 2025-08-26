import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@shared/schema";
import * as L from "leaflet";
import { useTheme } from "next-themes";

export default function InteractiveMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const pathLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedCorridor, setSelectedCorridor] = useState("All Corridors");

  const { theme } = useTheme();

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    refetchInterval: 30000,
  });

  const corridors = ["All Corridors", "Beira", "Nacala", "Central (Dar es Salaam)", "Durban"];
  const corridorColors: Record<string, string> = {
    Beira: "#0EA5E9",
    Nacala: "#10B981",
    "Central (Dar es Salaam)": "#F59E0B",
    Durban: "#8B5CF6",
  };

  // Approximate Malawi corridor paths (rough visualization)
  const corridorPaths: Record<string, [number, number][]> = {
    Beira: [
      [-15.7861, 35.0058], // Blantyre
      [-16.5, 35.0],
      [-19.8200, 34.8440], // Beira
    ],
    Nacala: [
      [-13.9626, 33.7741], // Lilongwe
      [-15.0, 36.0],
      [-14.5417, 40.6728], // Nacala
    ],
    "Central (Dar es Salaam)": [
      [-11.4650, 34.0200], // Mzuzu
      [-8.9000, 34.0000],
      [-6.7924, 39.2083], // Dar es Salaam
    ],
    Durban: [
      [-15.7861, 35.0058], // Blantyre
      [-23.9000, 31.0000],
      [-29.8587, 31.0218], // Durban
    ],
  };

  const filteredVehicles = selectedCorridor === "All Corridors"
    ? vehicles
    : vehicles.filter(v => v.corridor === selectedCorridor);

  const getTileConfig = (mode: string | undefined) => {
    const dark = mode === "dark";
    const url = dark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    const attribution =
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    return { url, attribution };
  };

  useEffect(() => {
    if (!mapContainerRef.current || leafletMapRef.current) return;

    // Center on Malawi by default
    const malawiCenter: L.LatLngExpression = [-13.2543, 34.3015];
    const initialCenter: L.LatLngExpression = vehicles.length
      ? [vehicles[0].latitude, vehicles[0].longitude]
      : malawiCenter;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: vehicles.length ? 8 : 6,
      zoomControl: false,
    });
    leafletMapRef.current = map;

    const { url, attribution } = getTileConfig(theme);
    const tile = L.tileLayer(url, { attribution, maxZoom: 19 });
    tile.addTo(map);
    tileLayerRef.current = tile;

    // Layer for markers
    const markers = L.layerGroup();
    markers.addTo(map);
    markerLayerRef.current = markers;

    // Layer for corridor paths
    const paths = L.layerGroup();
    paths.addTo(map);
    pathLayerRef.current = paths;

    return () => {
      map.remove();
      leafletMapRef.current = null;
      tileLayerRef.current = null;
      markerLayerRef.current = null;
      pathLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapContainerRef.current]);

  // Update tile layer when theme changes
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;

    const { url, attribution } = getTileConfig(theme);

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const tile = L.tileLayer(url, { attribution, maxZoom: 19 });
    tile.addTo(map);
    tileLayerRef.current = tile;
  }, [theme]);

  // Update markers and corridor paths when vehicles or corridor filter changes
  useEffect(() => {
    if (!leafletMapRef.current || !markerLayerRef.current || !pathLayerRef.current) return;

    const map = leafletMapRef.current;
    const markers = markerLayerRef.current;
    const paths = pathLayerRef.current;

    markers.clearLayers();
    paths.clearLayers();

    // Draw corridor paths
    const corridorsToDraw = selectedCorridor === "All Corridors"
      ? Object.keys(corridorPaths)
      : [selectedCorridor];

    const allBounds: L.LatLngExpression[] = [];

    corridorsToDraw.forEach((name) => {
      const coords = corridorPaths[name];
      if (coords && coords.length > 0) {
        const color = corridorColors[name] || "#0EA5E9";
        const poly = L.polyline(coords, { color, weight: 3, opacity: 0.9 });
        poly.addTo(paths);
        coords.forEach(c => allBounds.push(c));
      }
    });

    // Draw vehicle markers
    filteredVehicles.forEach((vehicle) => {
      const color = corridorColors[vehicle.corridor] || "#0EA5E9";
      const circle = L.circleMarker([vehicle.latitude, vehicle.longitude], {
        radius: 6,
        color,
        fillColor: color,
        fillOpacity: 0.9,
        weight: 2,
      });
      circle.on("click", () => setSelectedVehicle(vehicle));
      circle.bindTooltip(
        `${vehicle.id} - ${vehicle.driverName} - Speed: ${vehicle.speed} km/h`,
      );
      circle.addTo(markers);
      allBounds.push([vehicle.latitude, vehicle.longitude]);
    });

    // Fit bounds if we have any points
    if (allBounds.length > 0) {
      const bounds = L.latLngBounds(allBounds as [number, number][]);
      map.fitBounds(bounds.pad(0.2));
    }
  }, [filteredVehicles, selectedCorridor]);

  const handleZoomIn = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomOut();
  };

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Live Vehicle Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg bg-accent flex items-center justify-center">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
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
                    ? "bg-dashboard-blue text-white"
                    : "bg-accent text-foreground/80 hover:bg-dashboard-blue hover:text-white"
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
          className="h-96 rounded-lg relative overflow-hidden"
          data-testid="vehicle-map"
        />

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button
            size="sm"
            className="w-8 h-8 bg-card border border-border"
            data-testid="map-zoom-in"
            onClick={handleZoomIn}
          >
            +
          </Button>
          <Button
            size="sm"
            className="w-8 h-8 bg-card border border-border"
            data-testid="map-zoom-out"
            onClick={handleZoomOut}
          >
            −
          </Button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-card/90 rounded-lg p-3 text-xs">
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

        {/* Vehicle Details Panel */}
        {selectedVehicle && (
          <div className="mt-4 bg-accent rounded-lg p-4" data-testid="vehicle-details-panel">
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
                    selectedVehicle.status === "active" ? "text-green-500" : 
                    selectedVehicle.status === "idle" ? "text-yellow-500" : "text-red-500"
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
