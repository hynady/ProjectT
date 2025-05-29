package com.ticket.servermono.ticketcontext.infrastructure.kafka;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.servermono.ticketcontext.adapters.dtos.BookingLockRequest;
import com.ticket.servermono.ticketcontext.usecases.TicketLockService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Lắng nghe các event từ Kafka liên quan đến thanh toán vé
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TicketPaymentEventConsumer {

    private final TicketLockService ticketLockService;
    private final ObjectMapper objectMapper;
      /**
     * Lắng nghe và xử lý sự kiện thanh toán thành công
     * Trong một transaction riêng để đảm bảo pessimistic lock hoạt động đúng
     */
    @KafkaListener(topics = "payment.success", groupId = "ticket-processor")
    @Transactional
    public void handlePaymentSuccessEvent(String jsonEvent) {
        try {
            // Đọc JSON thành Map
            @SuppressWarnings("unchecked")
            Map<String, Object> event = (Map<String, Object>) objectMapper.readValue(jsonEvent, Map.class);
            
            String paymentId = (String) event.get("paymentId");
            log.info("Nhận event PAYMENT_SUCCESS cho paymentId: {}", paymentId);
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> ticketItemMaps = (List<Map<String, Object>>) event.get("ticketItems");
            
            if (ticketItemMaps == null || ticketItemMaps.isEmpty()) {
                log.warn("Không có thông tin vé trong event thanh toán: {}", paymentId);
                return;
            }
            
            // Chuyển đổi dữ liệu từ Map sang đối tượng
            List<BookingLockRequest.TicketItem> ticketItems = ticketItemMaps.stream()
                    .map(this::convertToTicketItem)
                    .collect(Collectors.toList());
            
            // Chuyển đổi sang Map để sử dụng TicketLockService
            Map<String, Integer> ticketDetails = new HashMap<>();
            for (BookingLockRequest.TicketItem item : ticketItems) {
                ticketDetails.put(item.getId(), item.getQuantity());
            }
            
            // Sử dụng TicketLockService để giải phóng khóa vé
            String reason = String.format("Thanh toán thành công - paymentId: %s", paymentId);
            boolean success = ticketLockService.convertLockedToSold(ticketDetails, reason);
            
            if (success) {
                log.info("Đã hoàn tất giải phóng khóa vé sau thanh toán thành công cho paymentId: {}", paymentId);
            } else {
                log.error("Không thể giải phóng khóa vé sau thanh toán thành công cho paymentId: {}", paymentId);
            }
            
        } catch (Exception e) {
            log.error("Lỗi khi xử lý event thanh toán thành công: {}", e.getMessage(), e);
        }
    }
      /**
     * Chuyển đổi Map sang đối tượng TicketItem
     */
    private BookingLockRequest.TicketItem convertToTicketItem(Map<String, Object> map) {
        BookingLockRequest.TicketItem item = new BookingLockRequest.TicketItem();
        item.setId((String) map.get("id"));
        item.setType((String) map.get("type"));
        
        // Xử lý trường hợp số lượng có thể là Integer hoặc Double
        Object quantityObj = map.get("quantity");
        if (quantityObj instanceof Integer) {
            item.setQuantity((Integer) quantityObj);
        } else if (quantityObj instanceof Double) {
            item.setQuantity(((Double) quantityObj).intValue());
        }
        
        return item;
    }
}