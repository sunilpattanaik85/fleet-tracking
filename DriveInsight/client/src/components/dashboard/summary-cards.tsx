import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Play, Gauge, Construction, Map, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SummaryStats {
  totalVehicles: number;
  activeVehicles: number;
  avgSpeed: number;
  totalDistanceToday: number;
  activeCorridors: number;
}

export default function SummaryCards() {
  const { data: summary, isLoading } = useQuery<SummaryStats>({
    queryKey: ["/api/analytics/summary"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-dashboard-secondary border-dashboard-accent">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-dashboard-accent rounded mb-2"></div>
                <div className="h-8 bg-dashboard-accent rounded mb-2"></div>
                <div className="h-4 bg-dashboard-accent rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load summary statistics</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Vehicles",
      value: summary.totalVehicles,
      change: "+12% from last month",
      trend: "up",
      icon: Truck,
      color: "dashboard-blue",
    },
    {
      title: "Active Vehicles",
      value: summary.activeVehicles,
      change: "+8% from yesterday",
      trend: "up",
      icon: Play,
      color: "green-500",
    },
    {
      title: "Avg Speed",
      value: `${summary.avgSpeed} km/h`,
      change: "-2% from yesterday",
      trend: "down",
      icon: Gauge,
      color: "dashboard-cyan",
    },
    {
      title: "Total Distance Today",
      value: `${summary.totalDistanceToday.toLocaleString()} km`,
      change: "+15% from yesterday",
      trend: "up",
      icon: Construction,
      color: "purple-500",
    },
    {
      title: "Active Corridors",
      value: summary.activeCorridors,
      change: "All operational",
      trend: "stable",
      icon: Map,
      color: "orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === "up" ? TrendingUp : card.trend === "down" ? TrendingDown : Minus;
        const trendColor = card.trend === "up" ? "text-green-600" : card.trend === "down" ? "text-yellow-600" : "text-muted-foreground";

        return (
          <Card
            key={card.title}
            className="bg-dashboard-secondary border-dashboard-accent"
            data-testid={`summary-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{card.title}</p>
                  <p className="text-3xl font-bold" data-testid={`summary-value-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {card.value}
                  </p>
                  <p className={`text-sm flex items-center mt-1 ${trendColor}`}>
                    <TrendIcon className="h-3 w-3 mr-1" />
                    <span>{card.change}</span>
                  </p>
                </div>
                <div className={`w-12 h-12 bg-${card.color} bg-opacity-20 rounded-lg flex items-center justify-center`}>
                  <Icon className={`text-${card.color} h-6 w-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}