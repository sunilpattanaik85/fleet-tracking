package com.driveinsight.config;

import com.driveinsight.ws.VehicleWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final VehicleWebSocketHandler vehicleWebSocketHandler;

    public WebSocketConfig(VehicleWebSocketHandler vehicleWebSocketHandler) {
        this.vehicleWebSocketHandler = vehicleWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(vehicleWebSocketHandler, "/ws").setAllowedOriginPatterns("*");
    }
}

