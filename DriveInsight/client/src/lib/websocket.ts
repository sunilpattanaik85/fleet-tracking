import { queryClient } from "./queryClient";

let ws: WebSocket | null = null;

export function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'vehicle_update') {
          // Invalidate vehicle-related queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
          queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
          queryClient.invalidateQueries({ queryKey: ["/api/analytics/corridors"] });
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        connectWebSocket();
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  } catch (error) {
    console.error('Failed to connect WebSocket:', error);
  }

  return () => {
    if (ws) {
      ws.close();
      ws = null;
    }
  };
}

export function sendMessage(message: any) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}
