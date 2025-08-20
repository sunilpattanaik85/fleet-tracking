import { Truck, BarChart3, MapPin, Car, Route, PieChart, Bell, Settings } from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: BarChart3, current: true },
  { name: "Live Tracking", icon: MapPin, current: false },
  { name: "Vehicles", icon: Car, current: false },
  { name: "Routes", icon: Route, current: false },
  { name: "Analytics", icon: PieChart, current: false },
  { name: "Alerts", icon: Bell, current: false },
  { name: "Settings", icon: Settings, current: false },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-dashboard-secondary border-r border-dashboard-accent">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-dashboard-blue rounded-lg flex items-center justify-center">
            <Truck className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold" data-testid="app-title">FleetTrack</h1>
            <p className="text-gray-400 text-xs">Analytics Dashboard</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${
                  item.current
                    ? "bg-dashboard-blue text-white"
                    : "text-gray-300 hover:bg-dashboard-accent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
