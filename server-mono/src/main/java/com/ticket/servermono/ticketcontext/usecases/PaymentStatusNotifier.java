package com.ticket.servermono.ticketcontext.usecases;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.servermono.ticketcontext.infrastructure.events.PaymentStatusEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service gửi thông báo cập nhật trạng thái thanh toán
 * Sử dụng ApplicationEventPublisher để phát đi sự kiện và phá vỡ vòng tròn phụ thuộc
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentStatusNotifier {

    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;
    
    // Lưu trữ trạng thái thanh toán gần nhất
    private final Map<String, String> latestStatuses = new ConcurrentHashMap<>();

    /**
     * Gửi thông báo cập nhật trạng thái thanh toán
     */
    public void sendPaymentStatusUpdate(String paymentId, String status) {
        sendPaymentStatusUpdate(paymentId, status, null);
    }

    /**
     * Gửi thông báo cập nhật trạng thái thanh toán kèm thông điệp
     */
    public void sendPaymentStatusUpdate(String paymentId, String status, String message) {
        // Lưu trạng thái mới nhất
        latestStatuses.put(paymentId, status);
        
        try {
            // Tạo JSON data
            Map<String, Object> data;
            if (message != null && !message.isEmpty()) {
                data = Map.of(
                    "type", "payment_status",
                    "status", status,
                    "message", message,
                    "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
                );
            } else {
                data = Map.of(
                    "type", "payment_status",
                    "status", status,
                    "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
                );
            }
            
            // Chuyển đổi thành JSON
            String jsonData = objectMapper.writeValueAsString(data);
            
            // Phát sự kiện cho handlers khác xử lý
            PaymentStatusEvent event = new PaymentStatusEvent(paymentId, status, jsonData);
            eventPublisher.publishEvent(event);
            
            log.debug("Đã gửi sự kiện cập nhật trạng thái thanh toán: paymentId={}, status={}", 
                    paymentId, status);
        } catch (JsonProcessingException e) {
            log.error("Lỗi khi tạo JSON cho cập nhật trạng thái: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Lấy trạng thái gần nhất của một thanh toán
     */
    public String getLatestStatus(String paymentId) {
        return latestStatuses.getOrDefault(paymentId, "unknown");
    }
}