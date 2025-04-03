package com.ticket.servermono.ticketcontext.adapters.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket handler đơn giản để thông báo trạng thái thanh toán
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentStatusWebSocketHandler extends TextWebSocketHandler {
    
    private final ObjectMapper objectMapper;
    
    // Lưu trữ các phiên kết nối theo paymentId
    private static final Map<String, WebSocketSession> PAYMENT_SESSIONS = new ConcurrentHashMap<>();
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // Lấy payment ID từ đường dẫn
        String paymentId = extractPaymentId(session.getUri().getPath());
        
        log.info("Kết nối WebSocket mới: paymentId={}, sessionId={}", paymentId, session.getId());
        
        // Lưu session
        PAYMENT_SESSIONS.put(paymentId, session);
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // Lấy payment ID từ đường dẫn
        String paymentId = extractPaymentId(session.getUri().getPath());
        
        log.info("Đóng kết nối WebSocket: paymentId={}, sessionId={}, status={}", 
                paymentId, session.getId(), status);
        
        // Xóa session
        PAYMENT_SESSIONS.remove(paymentId);
    }
    
    /**
     * Gửi cập nhật trạng thái thanh toán tới client
     */
    public void sendPaymentStatusUpdate(String paymentId, String status) {
        WebSocketSession session = PAYMENT_SESSIONS.get(paymentId);
        
        if (session != null && session.isOpen()) {
            try {
                // Tạo message thông báo trạng thái
                Map<String, Object> message = Map.of(
                        "type", "payment_status",
                        "status", status,
                        "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
                );
                
                // Chuyển thành JSON và gửi đi
                String json = objectMapper.writeValueAsString(message);
                session.sendMessage(new TextMessage(json));
                
                log.info("Đã gửi cập nhật trạng thái thanh toán: paymentId={}, status={}", paymentId, status);
            } catch (IOException e) {
                log.error("Lỗi khi gửi cập nhật trạng thái thanh toán", e);
            }
        } else {
            log.warn("Không thể gửi cập nhật - không có phiên kết nối cho paymentId: {}", paymentId);
        }
    }
    
    /**
     * Lấy payment ID từ đường dẫn WebSocket
     */
    private String extractPaymentId(String path) {
        // Định dạng đường dẫn: /payment-ws/{paymentId}
        String[] parts = path.split("/");
        return parts[parts.length - 1];
    }
    
    /**
     * Kiểm tra xem có session đang hoạt động cho payment ID cụ thể không
     */
    public boolean hasActiveSession(String paymentId) {
        WebSocketSession session = PAYMENT_SESSIONS.get(paymentId);
        return session != null && session.isOpen();
    }
}