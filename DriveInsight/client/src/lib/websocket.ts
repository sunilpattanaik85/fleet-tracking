import { queryClient } from "./queryClient";

let ws: WebSocket | null = null;

export function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const explicitUrl = (import.meta as any).env?.VITE_WS_URL as string | undefined;
  const isDev = (import.meta as any).env?.DEV as boolean | undefined;
  const host = window.location.hostname;
  const port = explicitUrl
    ? undefined
    : isDev
      ? ((import.meta as any).env?.VITE_BACKEND_PORT as string | undefined) || '5000'
      : window.location.port;
  const wsUrl = explicitUrl || `${protocol}//${host}${port ? `:${port}` : ''}/ws`;

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
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
