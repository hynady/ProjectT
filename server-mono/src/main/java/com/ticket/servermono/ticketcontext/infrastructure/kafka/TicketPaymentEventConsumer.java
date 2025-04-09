package com.ticket.servermono.ticketcontext.infrastructure.kafka;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.servermono.ticketcontext.adapters.dtos.BookingLockRequest;
import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Lắng nghe các event từ Kafka liên quan đến thanh toán vé
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TicketPaymentEventConsumer {

    private final TicketClassRepository ticketClassRepository;
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
            Map<String, Object> event = objectMapper.readValue(jsonEvent, Map.class);
            
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
            
            // Xử lý giải phóng khóa vé trong transaction riêng
            releaseTicketLocks(ticketItems);
            
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
    
    /**
     * Giải phóng khóa vé sau khi đã tạo vé thành công
     */
    private void releaseTicketLocks(List<BookingLockRequest.TicketItem> ticketItems) {
        try {
            // Thu thập tất cả ticketClassId để áp dụng pessimistic lock
            List<UUID> ticketClassIds = ticketItems.stream()
                .map(item -> UUID.fromString(item.getId()))
                .collect(Collectors.toList());
            
            // Sử dụng pessimistic lock để khóa tất cả ticket class một lúc
            List<TicketClass> ticketClasses = ticketClassRepository.findAllByIdWithPessimisticLock(ticketClassIds);
            
            // Tạo map để truy cập dễ dàng
            Map<UUID, TicketClass> ticketClassMap = ticketClasses.stream()
                .collect(Collectors.toMap(TicketClass::getId, tc -> tc));
            
            // Cập nhật lockedCapacity cho mỗi ticket class
            for (BookingLockRequest.TicketItem item : ticketItems) {
                UUID ticketClassId = UUID.fromString(item.getId());
                TicketClass ticketClass = ticketClassMap.get(ticketClassId);
                
                if (ticketClass != null) {
                    // Đảm bảo không đặt lockedCapacity thành số âm
                    int newLockedCapacity = Math.max(0, ticketClass.getLockedCapacity() - item.getQuantity());
                    ticketClass.setLockedCapacity(newLockedCapacity);
                    log.info("Đã giải phóng khóa {} vé cho hạng vé {}", item.getQuantity(), ticketClass.getName());
                }
            }
            
            // Lưu tất cả các thay đổi trong một transaction
            ticketClassRepository.saveAll(ticketClasses);
        } catch (Exception e) {
            log.error("Lỗi khi giải phóng khóa vé: {}", e.getMessage(), e);
        }
    }
}