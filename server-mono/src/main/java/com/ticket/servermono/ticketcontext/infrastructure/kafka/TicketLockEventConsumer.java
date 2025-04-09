package com.ticket.servermono.ticketcontext.infrastructure.kafka;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.servermono.ticketcontext.domain.enums.PaymentStatus;
import com.ticket.servermono.ticketcontext.entities.Invoice;
import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.InvoiceRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;
import com.ticket.servermono.ticketcontext.usecases.PaymentStatusNotifier;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Lắng nghe và xử lý các sự kiện liên quan đến khóa vé
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TicketLockEventConsumer {

    private final TicketClassRepository ticketClassRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentStatusNotifier statusNotifier;
    private final ObjectMapper objectMapper;

    /**
     * Xử lý sự kiện hết hạn khóa vé
     * Được gọi khi một invoice hết hạn, cần giải phóng khóa vé liên quan
     */
    @KafkaListener(topics = "ticket.lock.expiration", groupId = "ticket-processor")
    @Transactional
    public void handleTicketLockExpirationEvent(String jsonEvent) {
        try {
            // Đọc JSON thành Map
            Map<String, Object> event = objectMapper.readValue(jsonEvent, Map.class);
            
            String paymentId = (String) event.get("paymentId");
            log.info("Nhận sự kiện hết hạn khóa vé cho paymentId: {}", paymentId);
            
            @SuppressWarnings("unchecked")
            Map<String, Integer> ticketDetails = (Map<String, Integer>) event.get("ticketDetails");
            
            if (ticketDetails == null || ticketDetails.isEmpty()) {
                log.warn("Không có thông tin vé cần giải phóng khóa cho payment: {}", paymentId);
                return;
            }
            
            // Thu thập tất cả ticketClassId để áp dụng pessimistic lock
            List<UUID> ticketClassIds = ticketDetails.keySet().stream()
                .map(UUID::fromString)
                .collect(Collectors.toList());
            
            // Sử dụng pessimistic lock để khóa tất cả ticket class một lúc
            List<TicketClass> ticketClasses = ticketClassRepository.findAllByIdWithPessimisticLock(ticketClassIds);
            
            // Tạo map để truy cập dễ dàng
            Map<UUID, TicketClass> ticketClassMap = ticketClasses.stream()
                .collect(Collectors.toMap(TicketClass::getId, tc -> tc));
            
            // Cập nhật lockedCapacity cho mỗi ticket class
            for (Map.Entry<String, Integer> entry : ticketDetails.entrySet()) {
                UUID ticketClassId = UUID.fromString(entry.getKey());
                int quantity = entry.getValue();
                
                TicketClass ticketClass = ticketClassMap.get(ticketClassId);
                
                if (ticketClass != null) {
                    // Đảm bảo không đặt lockedCapacity thành số âm
                    int newLockedCapacity = Math.max(0, ticketClass.getLockedCapacity() - quantity);
                    ticketClass.setLockedCapacity(newLockedCapacity);
                    log.info("Đã giải phóng khóa {} vé cho hạng vé {} (hết hạn)", 
                            quantity, ticketClass.getName());
                }
            }
            
            // Lưu tất cả các thay đổi trong một transaction
            ticketClassRepository.saveAll(ticketClasses);
            
            // Gửi thông báo đến client (nếu cần)
            statusNotifier.sendPaymentStatusUpdate(paymentId, "expired", "Đặt vé đã hết hạn");
            
        } catch (Exception e) {
            log.error("Lỗi khi xử lý sự kiện hết hạn khóa vé: {}", e.getMessage(), e);
        }
    }
}