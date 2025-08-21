import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function CorridorAnalytics() {
  const { data: corridorData = [], isLoading: corridorLoading } = useQuery<{ corridor: string; count: number }[]>({
    queryKey: ["/api/analytics/corridors"],
    refetchInterval: 30000,
  });

  const colors = ["#0EA5E9", "#10B981", "#F59E0B", "#8B5CF6"];

  if (corridorLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-dashboard-secondary border-dashboard-accent">
          <CardHeader>
            <CardTitle>Corridor Distribution</CardTitle>
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

  const pieData = corridorData.map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
  }));

  const speedData = [
    { corridor: "North", speed: 48.2 },
    { corridor: "South", speed: 42.1 },
    { corridor: "East", speed: 39.8 },
    { corridor: "West", speed: 45.7 },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-dashboard-secondary border-dashboard-accent">
        <CardHeader>
          <CardTitle data-testid="corridor-distribution-title">Corridor Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {corridorData.map((item, index) => (
              <div
                key={item.corridor}
                className="flex items-center justify-between"
                data-testid={`corridor-stat-${item.corridor.toLowerCase()}`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span>{item.corridor}</span>
                </div>
                <span className="font-medium">{item.count} vehicles</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-dashboard-secondary border-dashboard-accent">
        <CardHeader>
          <CardTitle data-testid="corridor-speed-title">Average Speed by Corridor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {speedData.map((item, index) => {
              const percentage = (item.speed / 60) * 100; // Assuming 60 km/h is max for visualization
              return (
                <div key={item.corridor} data-testid={`speed-stat-${item.corridor.toLowerCase()}`}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.corridor}</span>
                    <span>{item.speed} km/h</span>
                  </div>
                  <div className="w-full bg-dashboard-accent rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[index % colors.length],
                      }}
                    />
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