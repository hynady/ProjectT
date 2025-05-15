package com.ticket.servermono.ticketcontext.adapters.websocket;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.ticket.servermono.ticketcontext.domain.enums.PaymentStatus;
import com.ticket.servermono.ticketcontext.entities.Invoice;
import com.ticket.servermono.ticketcontext.infrastructure.events.PaymentStatusEvent;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.InvoiceRepository;
import com.ticket.servermono.ticketcontext.usecases.PaymentService;

import lombok.extern.slf4j.Slf4j;

/**
 * WebSocket handler cho việc theo dõi trạng thái thanh toán
 * Sử dụng EventListener để lắng nghe sự kiện thay đổi trạng thái thanh toán
 */
@Slf4j
@Component
public class PaymentStatusWebSocketHandler extends TextWebSocketHandler {
    
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final InvoiceRepository invoiceRepository;
    private final PaymentService paymentService;
    
    public PaymentStatusWebSocketHandler(
            InvoiceRepository invoiceRepository,
            PaymentService paymentService) {
        this.invoiceRepository = invoiceRepository;
        this.paymentService = paymentService;
    }
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String path = session.getUri().getPath();
        String paymentId = extractPaymentIdFromPath(path);
        
        if (paymentId == null) {
            session.close(CloseStatus.BAD_DATA.withReason("Invalid payment ID format"));
            return;
        }
        
        log.info("WebSocket connection established for payment: {}", paymentId);
        sessions.put(paymentId, session);
        
        // Gửi trạng thái hiện tại
        Optional<Invoice> invoiceOpt = invoiceRepository.findByPaymentId(paymentId);
        if (invoiceOpt.isPresent()) {
            Invoice invoice = invoiceOpt.get();
            
            // Bắt đầu theo dõi thanh toán khi kết nối WebSocket thiết lập
            if (invoice.getStatus() == PaymentStatus.WAITING_PAYMENT) {
                log.info("Bắt đầu theo dõi thanh toán khi WebSocket được thiết lập: {}", paymentId);
                paymentService.startPaymentTracking(
                    paymentId,
                    invoice.getSoTien(),
                    invoice.getNoiDung()
                );
            }
        } else {
            session.close(CloseStatus.BAD_DATA.withReason("Payment ID not found"));
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String path = session.getUri().getPath();
        String paymentId = extractPaymentIdFromPath(path);
        
        if (paymentId != null) {
            sessions.remove(paymentId);
            log.info("WebSocket connection closed for payment: {}", paymentId);
        }
    }
    
    /**
     * Lắng nghe sự kiện thay đổi trạng thái thanh toán và gửi đến client qua WebSocket
     */
    @EventListener
    public void handlePaymentStatusChange(PaymentStatusEvent event) {
        String paymentId = event.getPaymentId();
        WebSocketSession session = sessions.get(paymentId);
        
        if (session != null && session.isOpen()) {
            try {
                // Gửi dữ liệu JSON đã được chuẩn bị trước đó
                session.sendMessage(new TextMessage(event.getJsonData()));
                log.debug("Đã gửi cập nhật trạng thái thanh toán qua WebSocket: paymentId={}, status={}", 
                        paymentId, event.getStatus());
            } catch (IOException e) {
                log.error("Lỗi gửi cập nhật qua WebSocket: {}", e.getMessage(), e);
            }
        }
    }
    
    /**
     * Extracts payment ID from the path /api/payment-ws/{paymentId}
     */
    private String extractPaymentIdFromPath(String path) {
        if (path == null) return null;
        
        String[] parts = path.split("/");
        if (parts.length < 2) return null;
        
        return parts[parts.length - 1];
    }
}