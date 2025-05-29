package com.ticket.servermono.ticketcontext.infrastructure.scheduler;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.servermono.ticketcontext.domain.enums.PaymentStatus;
import com.ticket.servermono.ticketcontext.entities.Invoice;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.InvoiceRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Scheduler để quản lý việc tự động giải phóng khóa vé đã hết hạn
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TicketLockExpirationScheduler {

    private final InvoiceRepository invoiceRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    
    private static final String TICKET_LOCK_EXPIRATION_TOPIC = "ticket.lock.expiration";    /**
     * Chạy định kỳ mỗi 30 giây để kiểm tra và xử lý các khóa vé đã hết hạn
     * Cách tiếp cận tối ưu:
     * 1. Chỉ truy vấn các invoice đang ở trạng thái WAITING_PAYMENT và đã hết hạn
     * 2. Đánh dấu các invoice này là hết hạn
     * 3. Gửi sự kiện để xử lý giải phóng khóa vé trong một quá trình riêng
     */
    @Scheduled(fixedRate = 30000) // 30 giây
    @Transactional
    public void processExpiredTicketLocks() {
        LocalDateTime now = LocalDateTime.now();
        
        try {
            log.debug("Bắt đầu kiểm tra invoice hết hạn lúc: {}", now);
            
            // Tìm tất cả invoice đang chờ thanh toán và đã hết hạn
            List<Invoice> expiredInvoices = invoiceRepository.findByStatusAndExpiresAtBefore(
                    PaymentStatus.WAITING_PAYMENT, now);
            
            if (expiredInvoices.isEmpty()) {
                log.debug("Không có invoice nào hết hạn tại thời điểm: {}", now);
                return;
            }
            
            log.info("Tìm thấy {} hóa đơn đã hết hạn cần giải phóng khóa vé", expiredInvoices.size());
            
            // Log chi tiết các invoice hết hạn
            expiredInvoices.forEach(invoice -> {
                log.info("Invoice {} (payment: {}) hết hạn lúc: {}, hiện tại: {}", 
                        invoice.getId(), 
                        invoice.getPaymentId(), 
                        invoice.getExpiresAt(), 
                        now);
            });
            
            // Cập nhật trạng thái sang PAYMENT_EXPIRED
            expiredInvoices.forEach(invoice -> {
                invoice.setStatus(PaymentStatus.PAYMENT_EXPIRED);
            });
            
            // Lưu tất cả các invoice đã cập nhật
            invoiceRepository.saveAll(expiredInvoices);
            log.info("Đã cập nhật trạng thái PAYMENT_EXPIRED cho {} invoice", expiredInvoices.size());
            
            // Gửi sự kiện để xử lý giải phóng khóa vé
            int successCount = 0;
            for (Invoice invoice : expiredInvoices) {
                if (sendTicketLockExpirationEvent(invoice)) {
                    successCount++;
                }
            }
            
            log.info("Đã gửi thành công {}/{} sự kiện giải phóng khóa vé", successCount, expiredInvoices.size());
            
        } catch (Exception e) {
            log.error("Lỗi khi xử lý các khóa vé hết hạn: {}", e.getMessage(), e);
        }
    }
      /**
     * Gửi sự kiện để xử lý giải phóng khóa vé
     * @param invoice Invoice cần giải phóng khóa
     * @return true nếu gửi thành công, false nếu có lỗi
     */
    private boolean sendTicketLockExpirationEvent(Invoice invoice) {
        try {
            Map<String, Object> eventData = Map.of(
                "invoiceId", invoice.getId().toString(),
                "paymentId", invoice.getPaymentId(),
                "ticketDetails", invoice.getTicketDetails(),
                "timestamp", LocalDateTime.now().toString()
            );
            
            String jsonEvent = objectMapper.writeValueAsString(eventData);
            
            kafkaTemplate.send(TICKET_LOCK_EXPIRATION_TOPIC, invoice.getPaymentId(), jsonEvent);
            log.info("Đã gửi sự kiện giải phóng khóa vé cho invoice: {}, paymentId: {}, ticketDetails: {}", 
                    invoice.getId(), invoice.getPaymentId(), invoice.getTicketDetails());
            return true;
        } catch (JsonProcessingException e) {
            log.error("Lỗi khi tạo JSON cho sự kiện giải phóng khóa vé của invoice {}: {}", 
                    invoice.getId(), e.getMessage(), e);
            return false;
        } catch (Exception e) {
            log.error("Lỗi khi gửi sự kiện giải phóng khóa vé cho invoice {}: {}", 
                    invoice.getId(), e.getMessage(), e);
            return false;
        }
    }
}