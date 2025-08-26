import { queryClient } from "./queryClient";

let ws: WebSocket | null = null;
let reconnectTimer: number | null = null;

export function connectWebSocket() {
  const disabled = import.meta.env.VITE_WS_DISABLED === "true";
  if (disabled) {
    return () => {};
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const configuredUrl = import.meta.env.VITE_WS_URL as string | undefined;
  const defaultUrl = `${protocol}//${window.location.host}/ws`;
  const wsUrl = configuredUrl || defaultUrl;

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected', wsUrl);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.vehicleId || data.type === 'vehicle_update') {
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
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      // Attempt to reconnect after 5 seconds unless disabled
      reconnectTimer = window.setTimeout(() => {
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
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
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
