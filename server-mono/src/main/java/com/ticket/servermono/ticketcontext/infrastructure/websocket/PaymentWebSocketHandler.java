package com.ticket.servermono.ticketcontext.infrastructure.websocket;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * WebSocket handler for payment status updates.
 * This class is responsible ONLY for managing WebSocket connections and sending messages.
 * It does NOT handle payment status logic or scheduling.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentWebSocketHandler extends TextWebSocketHandler {
    
    private final ObjectMapper objectMapper;
    
    // Map to store active sessions by payment ID
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // Extract payment ID from the session's URI path
        String paymentId = extractPaymentIdFromUri(session.getUri().getPath());
        log.info("WebSocket connection established for payment ID: {}, session ID: {}", 
                paymentId, session.getId());
        
        // Store the session
        sessions.put(paymentId, session);
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // Extract payment ID from the session's URI path
        String paymentId = extractPaymentIdFromUri(session.getUri().getPath());
        log.info("WebSocket connection closed for payment ID: {}, session ID: {}, status: {}", 
                paymentId, session.getId(), status);
        
        // Remove the session
        sessions.remove(paymentId);
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // Handle incoming messages if needed
        log.info("Received message from client: {}", message.getPayload());
        
        // No action needed for now as we're just sending updates to the client
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("Transport error in WebSocket session: {}", session.getId(), exception);
        
        // Close the session
        try {
            session.close(CloseStatus.SERVER_ERROR);
        } catch (IOException e) {
            log.error("Error closing WebSocket session after transport error", e);
        }
        
        // Extract payment ID and clean up
        String paymentId = extractPaymentIdFromUri(session.getUri().getPath());
        sessions.remove(paymentId);
    }
    
    /**
     * Extract payment ID from the WebSocket URI path
     */
    private String extractPaymentIdFromUri(String path) {
        // Expected path format: /api/payment-ws/{paymentId}
        String[] parts = path.split("/");
        return parts[parts.length - 1];
    }
    
    /**
     * Send payment status update to client.
     * This method is ONLY responsible for sending the message, not determining when to send it.
     */
    public void sendPaymentStatus(String paymentId, String status) {
        WebSocketSession session = sessions.get(paymentId);
        if (session != null && session.isOpen()) {
            try {
                // Create status update message
                Map<String, Object> statusUpdate = Map.of(
                        "type", "payment_status",
                        "status", status,
                        "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
                );
                
                // Convert to JSON and send
                String json = objectMapper.writeValueAsString(statusUpdate);
                session.sendMessage(new TextMessage(json));
                
                log.info("Sent payment status update to client: paymentId={}, status={}", paymentId, status);
            } catch (IOException e) {
                log.error("Error sending payment status update", e);
            }
        } else {
            log.warn("Cannot send status update - no active session for payment ID: {}", paymentId);
        }
    }
    
    /**
     * Check if there is an active session for the given payment ID
     */
    public boolean hasActiveSession(String paymentId) {
        WebSocketSession session = sessions.get(paymentId);
        return session != null && session.isOpen();
    }
}