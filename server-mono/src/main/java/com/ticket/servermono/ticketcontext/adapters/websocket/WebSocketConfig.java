package com.ticket.servermono.ticketcontext.adapters.websocket;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import lombok.extern.slf4j.Slf4j;

/**
 * Cấu hình WebSocket đơn giản 
 */
@Configuration
@EnableWebSocket
@Slf4j
public class WebSocketConfig implements WebSocketConfigurer {

    private final PaymentStatusWebSocketHandler paymentStatusWebSocketHandler;

    public WebSocketConfig(PaymentStatusWebSocketHandler paymentStatusWebSocketHandler) {
        this.paymentStatusWebSocketHandler = paymentStatusWebSocketHandler;
    }    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
      @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        log.info("Registering WebSocket handlers with frontend URL: {}", frontendUrl);
          // For native WebSocket clients
        registry.addHandler(paymentStatusWebSocketHandler, "/ws/payment-ws/{paymentId}")
                .setAllowedOrigins("*") // For development
                .setAllowedOriginPatterns("*");
                  // For SockJS fallback
        registry.addHandler(paymentStatusWebSocketHandler, "/ws/payment-ws/{paymentId}")
                .setAllowedOrigins("*") // For development
                .setAllowedOriginPatterns("*")
                .withSockJS();
                
        log.info("WebSocket handlers registered successfully");
    }
}
