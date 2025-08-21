import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import type { DailyMetrics } from "@shared/schema";

export default function PerformanceMetrics() {
  const { data: metrics = [], isLoading } = useQuery<DailyMetrics[]>({
    queryKey: ["/api/metrics/daily"],
    refetchInterval: 30000,
  });

  // Mock leaderboard data since we don't have enough vehicles in seed data
  const leaderboardData = [
    { vehicleId: "V-012", driver: "Emily Rodriguez", efficiency: 18.2, change: "+2.3%" },
    { vehicleId: "V-008", driver: "David Kim", efficiency: 17.8, change: "+1.8%" },
    { vehicleId: "V-015", driver: "Anna Thompson", efficiency: 17.1, change: "+0.9%" },
    { vehicleId: "V-003", driver: "Mike Davis", efficiency: 16.9, change: "+1.2%" },
    { vehicleId: "V-001", driver: "John Smith", efficiency: 16.5, change: "-0.5%" },
  ];

  const distanceChartData = metrics.map(metric => ({
    vehicleId: metric.vehicleId,
    distance: metric.totalDistance,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-dashboard-secondary border-dashboard-accent">
          <CardHeader>
            <CardTitle>Daily Distance by Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-dashboard-secondary border-dashboard-accent">
        <CardHeader>
          <CardTitle data-testid="distance-chart-title">Daily Distance by Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distanceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="vehicleId" 
                  axisLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                />
                <Bar 
                  dataKey="distance" 
                  fill="#0EA5E9"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-dashboard-secondary border-dashboard-accent">
        <CardHeader>
          <CardTitle data-testid="fuel-efficiency-title">Fuel Efficiency Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboardData.map((item, index) => {
              const bgOpacity = index === 0 ? "bg-opacity-50" : index === 1 ? "bg-opacity-30" : "bg-opacity-20";
              const rankColor = index === 0 ? "bg-yellow-400" : index === 1 ? "bg-gray-300" : "bg-orange-500";
              
              return (
                <div
                  key={item.vehicleId}
                  className={`flex items-center justify-between p-3 bg-dashboard-accent ${bgOpacity} rounded-lg`}
                  data-testid={`leaderboard-item-${index + 1}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${rankColor} rounded-full flex items-center justify-center text-foreground font-bold text-sm`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.vehicleId}</p>
                      <p className="text-muted-foreground text-xs">{item.driver}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{item.efficiency} km/L</p>
                    <p className="text-muted-foreground text-xs">{item.change} this week</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}