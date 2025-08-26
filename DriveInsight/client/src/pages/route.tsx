import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import * as L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Vehicle, Route } from "@shared/schema";

export default function RoutePage() {
  const [, params] = useRoute("/route/:vehicleId");
  const vehicleId = params?.vehicleId ?? "";

  const { data: vehicles = [] } = useQuery<Vehicle[]>({ queryKey: ["/api/vehicles"] });
  const vehicle = useMemo(() => vehicles.find(v => v.id === vehicleId), [vehicles, vehicleId]);

  const { data: routes = [] } = useQuery<Route[]>({ queryKey: ["/api/routes"] });
  const vehicleRoutes = useMemo(() => routes.filter(r => r.vehicleId === vehicleId), [routes, vehicleId]);
  const latest = vehicleRoutes[0];

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    const initialCenter: L.LatLngExpression = vehicle ? [vehicle.latitude, vehicle.longitude] : [-13.2543, 34.3015];
    const map = L.map(mapRef.current, { center: initialCenter, zoom: 10, zoomControl: true });
    leafletMapRef.current = map;
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);
    const layer = L.layerGroup().addTo(map);
    layerRef.current = layer;
    return () => { map.remove(); leafletMapRef.current = null; layerRef.current = null; };
  }, [mapRef.current]);

  useEffect(() => {
    if (!leafletMapRef.current || !layerRef.current) return;
    const map = leafletMapRef.current;
    const layer = layerRef.current;
    layer.clearLayers();

    if (latest) {
      // Fake a simple start/end polyline around the current vehicle position (no detailed points available)
      // If backend provides route coordinates, replace this with the actual polyline points
      const start: [number, number] = vehicle ? [vehicle.latitude, vehicle.longitude] : [-13.2543, 34.3015];
      const end: [number, number] = [start[0] + 0.2, start[1] + 0.2];
      const line = L.polyline([start, end], { color: "#0EA5E9", weight: 4 }).addTo(layer);
      L.marker(start).addTo(layer).bindPopup(`Start: ${latest.startLocation}`);
      L.marker(end).addTo(layer).bindPopup(`End: ${latest.endLocation}`);
      map.fitBounds(line.getBounds().pad(0.2));
    } else if (vehicle) {
      map.setView([vehicle.latitude, vehicle.longitude], 10);
    }
  }, [latest, vehicle]);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Route for {vehicleId}</CardTitle>
          <Button onClick={() => history.back()} variant="secondary">Back</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 rounded-lg overflow-hidden" ref={mapRef} />
        {!latest && (
          <div className="mt-4 text-sm text-muted-foreground">No route available for this vehicle.</div>
        )}
      </CardContent>
    </Card>
  );
}