import { queryClient } from "./queryClient";

let ws: WebSocket | null = null;
let lastSuccessfulUrl: string | null = null;

export function connectWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const envUrl = (import.meta as any).env?.VITE_WS_URL as string | undefined;
  const isDev = Boolean((import.meta as any).env?.DEV);
  const host = window.location.hostname;
  const currentPort = window.location.port;
  const candidates: string[] = [];

  if (envUrl) {
    candidates.push(envUrl);
  } else {
    // Prefer same-origin first (works when app and API are served on one port)
    const sameOrigin = `${protocol}//${host}${currentPort ? `:${currentPort}` : ""}/ws`;
    candidates.push(sameOrigin);

    // In dev, also try a common backend port (5000) if different from same-origin
    const devPort = ((import.meta as any).env?.VITE_BACKEND_PORT as string | undefined) || "5000";
    const devUrl = `${protocol}//${host}:${devPort}/ws`;
    if (devUrl !== sameOrigin) candidates.push(devUrl);
  }

  function tryConnect(urls: string[], attemptIndex = 0) {
    const url = urls[attemptIndex] ?? urls[0];
    try {
      ws = new WebSocket(url);
    } catch (error) {
      // If constructor throws synchronously, schedule next attempt
      if (attemptIndex + 1 < urls.length) {
        setTimeout(() => tryConnect(urls, attemptIndex + 1), 500);
      }
      return;
    }

  try {
    ws.onopen = () => {
      lastSuccessfulUrl = url;
      console.log("WebSocket connected", url);
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
      console.log("WebSocket disconnected");
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        // Prefer the last successful URL if available, otherwise retry candidates
        if (lastSuccessfulUrl) {
          tryConnect([lastSuccessfulUrl]);
        } else {
          tryConnect(candidates);
        }
      }, 5000);
    };

    ws.onerror = (_error) => {
      // If current attempt fails before open, try next candidate
      if (!lastSuccessfulUrl && attemptIndex + 1 < urls.length) {
        try { ws?.close(); } catch {}
        setTimeout(() => tryConnect(urls, attemptIndex + 1), 250);
      }
    };
  }

  tryConnect(candidates);

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
