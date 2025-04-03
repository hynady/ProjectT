package com.ticket.servermono.ticketcontext.adapters.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import lombok.RequiredArgsConstructor;

/**
 * Cấu hình WebSocket đơn giản 
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final PaymentStatusWebSocketHandler paymentStatusWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Đăng ký handler với đường dẫn
        registry.addHandler(paymentStatusWebSocketHandler, "/api/payment-ws/{paymentId}")
                .setAllowedOrigins("*"); // Trong môi trường production nên giới hạn nguồn gốc
    }
}
