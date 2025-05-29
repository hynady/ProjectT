package com.ticket.servermono.ticketcontext.infrastructure.kafka;

import java.util.Map;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.servermono.ticketcontext.usecases.PaymentStatusNotifier;
import com.ticket.servermono.ticketcontext.usecases.TicketLockService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Lắng nghe và xử lý các sự kiện liên quan đến khóa vé
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TicketLockEventConsumer {

    private final TicketLockService ticketLockService;
    private final PaymentStatusNotifier statusNotifier;
    private final ObjectMapper objectMapper;    /**
     * Xử lý sự kiện hết hạn khóa vé
     * Được gọi khi một invoice hết hạn, cần giải phóng khóa vé liên quan
     */
    @KafkaListener(topics = "ticket.lock.expiration", groupId = "ticket-processor")
    @Transactional
    public void handleTicketLockExpirationEvent(String jsonEvent) {
        try {
            // Đọc JSON thành Map
            @SuppressWarnings("unchecked")
            Map<String, Object> event = (Map<String, Object>) objectMapper.readValue(jsonEvent, Map.class);
            
            String paymentId = (String) event.get("paymentId");
            String invoiceId = (String) event.get("invoiceId");
            log.info("Bắt đầu xử lý sự kiện hết hạn khóa vé cho paymentId: {}, invoiceId: {}", paymentId, invoiceId);
            
            @SuppressWarnings("unchecked")
            Map<String, Integer> ticketDetails = (Map<String, Integer>) event.get("ticketDetails");
            
            if (ticketDetails == null || ticketDetails.isEmpty()) {
                log.warn("Không có thông tin vé cần giải phóng khóa cho payment: {}", paymentId);
                return;
            }
            
            log.info("Thông tin vé cần giải phóng: {}", ticketDetails);
            
            // Sử dụng TicketLockService để xử lý giải phóng khóa
            String reason = String.format("Hết hạn thanh toán - paymentId: %s, invoiceId: %s", paymentId, invoiceId);
            boolean success = ticketLockService.unlockTickets(ticketDetails, reason);
            
            if (success) {
                log.info("Đã hoàn tất giải phóng khóa vé cho paymentId: {}", paymentId);
                // Gửi thông báo đến client
                statusNotifier.sendPaymentStatusUpdate(paymentId, "expired", "Đặt vé đã hết hạn");
            } else {
                log.error("Không thể giải phóng khóa vé cho paymentId: {}", paymentId);
            }
            
        } catch (Exception e) {
            log.error("Lỗi nghiêm trọng khi xử lý sự kiện hết hạn khóa vé: {}", e.getMessage(), e);
            // Không re-throw để tránh Kafka retry liên tục nếu có lỗi JSON parsing
        }
    }
}