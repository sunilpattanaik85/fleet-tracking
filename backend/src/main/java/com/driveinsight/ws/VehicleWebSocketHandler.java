package com.driveinsight.ws;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;

@Component
public class VehicleWebSocketHandler implements WebSocketHandler {
    private final WebSocketSessionManager sessionManager;

    public VehicleWebSocketHandler(WebSocketSessionManager sessionManager) {
        this.sessionManager = sessionManager;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessionManager.addSession(session);
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        // No-op for now
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        sessionManager.removeSession(session);
        session.close(CloseStatus.SERVER_ERROR);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        sessionManager.removeSession(session);
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    public void broadcast(String json) {
        sessionManager.getSessions().forEach(s -> {
            try {
                if (s.isOpen()) {
                    s.sendMessage(new TextMessage(json));
                }
            } catch (Exception ignored) {}
        });
    }
}

