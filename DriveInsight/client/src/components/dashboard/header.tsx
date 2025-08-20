import { Search, RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleRefresh = () => {
    toast({
      title: "Dashboard refreshed",
      description: "All data has been updated successfully",
    });
  };

  return (
    <header className="bg-dashboard-secondary border-b border-dashboard-accent px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="page-title">
            Vehicle Analytics Dashboard
          </h2>
          <p className="text-gray-400 text-sm">
            Real-time fleet monitoring and analytics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="search-input"
              className="bg-dashboard-accent text-foreground placeholder-gray-500 px-4 py-2 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-dashboard-blue border-0"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          <Button
            onClick={handleRefresh}
            data-testid="refresh-button"
            className="bg-dashboard-blue hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-dashboard-blue rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium" data-testid="user-name">
              Admin User
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
