package com.ticket.servermono.ticketcontext.infrastructure.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final PaymentWebSocketHandler paymentWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Register the payment websocket handler and map it to the endpoint path
        registry.addHandler(paymentWebSocketHandler, "/api/payment-ws/{paymentId}")
            .setAllowedOrigins("*"); // In production, restrict this to specific domains
    }
}