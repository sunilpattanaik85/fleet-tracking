import { useEffect } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import SummaryCards from "@/components/dashboard/summary-cards";
import InteractiveMap from "@/components/dashboard/interactive-map";
import CorridorAnalytics from "@/components/dashboard/corridor-analytics";
import VehicleTable from "@/components/dashboard/vehicle-table";
import PerformanceMetrics from "@/components/dashboard/performance-metrics";
import AdvancedAnalytics from "@/components/dashboard/advanced-analytics";
import { connectWebSocket } from "@/lib/websocket";

export default function Dashboard() {
  useEffect(() => {
    const cleanup = connectWebSocket();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header />
        <div className="p-6 space-y-6">
          <SummaryCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <InteractiveMap />
            </div>
            <div>
              <CorridorAnalytics />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VehicleTable />
            <PerformanceMetrics />
          </div>

          <AdvancedAnalytics />
        </div>
      </div>
    </div>
  );
}
