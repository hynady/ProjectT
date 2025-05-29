package com.ticket.servermono.ticketcontext.usecases;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service tập trung để quản lý tất cả các thao tác liên quan đến ticket lock
 * Thay thế các logic rải rác ở nhiều nơi khác nhau
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TicketLockService {

    private final TicketClassRepository ticketClassRepository;

    /**
     * Khóa vé cho một danh sách ticket classes
     * @param ticketDetails Map<ticketClassId, quantity> cần khóa
     * @param reason Lý do khóa (để logging)
     * @return true nếu thành công, false nếu có lỗi
     */
    @Transactional
    public boolean lockTickets(Map<String, Integer> ticketDetails, String reason) {
        if (ticketDetails == null || ticketDetails.isEmpty()) {
            log.warn("Không có thông tin vé cần khóa. Lý do: {}", reason);
            return false;
        }

        try {
            log.info("Bắt đầu khóa {} loại vé. Lý do: {}", ticketDetails.size(), reason);

            // Thu thập tất cả ticketClassId
            List<UUID> ticketClassIds = ticketDetails.keySet().stream()
                .map(UUID::fromString)
                .collect(Collectors.toList());

            // Sử dụng pessimistic lock để đảm bảo consistency
            List<TicketClass> ticketClasses = ticketClassRepository.findAllByIdWithPessimisticLock(ticketClassIds);

            // Tạo map để truy cập dễ dàng
            Map<UUID, TicketClass> ticketClassMap = ticketClasses.stream()
                .collect(Collectors.toMap(TicketClass::getId, tc -> tc));

            int totalLocked = 0;
            
            // Cập nhật lockedCapacity cho mỗi ticket class
            for (Map.Entry<String, Integer> entry : ticketDetails.entrySet()) {
                UUID ticketClassId = UUID.fromString(entry.getKey());
                int quantity = entry.getValue();
                
                TicketClass ticketClass = ticketClassMap.get(ticketClassId);
                
                if (ticketClass != null) {
                    int currentLocked = ticketClass.getLockedCapacity();
                    int newLockedCapacity = currentLocked + quantity;
                      // Kiểm tra có đủ vé để khóa không
                    int soldTickets = ticketClass.getTickets() != null ? ticketClass.getTickets().size() : 0;
                    int availableTickets = ticketClass.getCapacity() - soldTickets - currentLocked;
                    if (availableTickets < quantity) {
                        log.error("Không đủ vé để khóa. Ticket class: {}, cần: {}, còn lại: {}", 
                                ticketClass.getName(), quantity, availableTickets);
                        return false;
                    }
                    
                    ticketClass.setLockedCapacity(newLockedCapacity);
                    totalLocked += quantity;
                    
                    log.info("Đã khóa {} vé cho {} (từ {} lên {}). Version: {}", 
                            quantity, ticketClass.getName(), currentLocked, newLockedCapacity, ticketClass.getVersion());
                }
            }

            // Lưu tất cả các thay đổi
            ticketClassRepository.saveAll(ticketClasses);
            
            log.info("Hoàn tất khóa {} vé. Lý do: {}", totalLocked, reason);
            return true;
            
        } catch (Exception e) {
            log.error("Lỗi khi khóa vé. Lý do: {}, Chi tiết: {}", reason, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Giải phóng khóa vé cho một danh sách ticket classes
     * @param ticketDetails Map<ticketClassId, quantity> cần giải phóng
     * @param reason Lý do giải phóng (để logging)
     * @return true nếu thành công, false nếu có lỗi
     */
    @Transactional
    public boolean unlockTickets(Map<String, Integer> ticketDetails, String reason) {
        if (ticketDetails == null || ticketDetails.isEmpty()) {
            log.warn("Không có thông tin vé cần giải phóng khóa. Lý do: {}", reason);
            return false;
        }

        try {
            log.info("Bắt đầu giải phóng khóa {} loại vé. Lý do: {}", ticketDetails.size(), reason);
            
            int totalProcessed = 0;
            int totalErrors = 0;
            
            // Xử lý từng ticket class riêng biệt để tránh conflict
            for (Map.Entry<String, Integer> entry : ticketDetails.entrySet()) {
                try {
                    UUID ticketClassId = UUID.fromString(entry.getKey());
                    int quantity = entry.getValue();
                    
                    boolean success = unlockSingleTicketClass(ticketClassId, quantity, reason);
                    if (success) {
                        totalProcessed++;
                    } else {
                        totalErrors++;
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi xử lý ticket class {}: {}", entry.getKey(), e.getMessage(), e);
                    totalErrors++;
                }
            }
            
            log.info("Hoàn tất giải phóng khóa vé. Lý do: {}. Thành công: {}, Lỗi: {}", 
                    reason, totalProcessed, totalErrors);
            
            return totalErrors == 0;
            
        } catch (Exception e) {
            log.error("Lỗi nghiêm trọng khi giải phóng khóa vé. Lý do: {}, Chi tiết: {}", reason, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Giải phóng khóa cho một ticket class cụ thể
     * @param ticketClassId ID của ticket class
     * @param quantity Số lượng vé cần giải phóng
     * @param reason Lý do giải phóng để logging
     * @return true nếu thành công, false nếu có lỗi
     */
    @Transactional
    public boolean unlockSingleTicketClass(UUID ticketClassId, int quantity, String reason) {
        try {
            log.debug("Bắt đầu giải phóng {} vé cho ticket class: {}. Lý do: {}", quantity, ticketClassId, reason);
            
            // Sử dụng pessimistic lock để đảm bảo consistency
            TicketClass ticketClass = ticketClassRepository.findByIdWithPessimisticLock(ticketClassId)
                .orElse(null);
            
            if (ticketClass == null) {
                log.warn("Không tìm thấy ticket class với ID: {}. Lý do: {}", ticketClassId, reason);
                return false;
            }
            
            // Log trạng thái trước khi update
            int currentLocked = ticketClass.getLockedCapacity();
            log.info("Ticket class {} - Trước khi update: lockedCapacity = {}, cần giảm = {}. Lý do: {}", 
                    ticketClass.getName(), currentLocked, quantity, reason);
            
            // Tính toán lockedCapacity mới
            int newLockedCapacity = Math.max(0, currentLocked - quantity);
            
            // Cập nhật giá trị
            ticketClass.setLockedCapacity(newLockedCapacity);
            
            // Lưu thay đổi
            TicketClass savedTicketClass = ticketClassRepository.save(ticketClass);
            
            // Verify sau khi lưu
            log.info("Ticket class {} - Sau khi update: lockedCapacity = {} (version: {}). " +
                    "Đã giải phóng {} vé. Lý do: {}", 
                    savedTicketClass.getName(), 
                    savedTicketClass.getLockedCapacity(),
                    savedTicketClass.getVersion(),
                    quantity, 
                    reason);
            
            return true;
            
        } catch (Exception e) {
            log.error("Lỗi khi giải phóng khóa ticket class {}. Lý do: {}, Chi tiết: {}", 
                    ticketClassId, reason, e.getMessage(), e);
            return false;
        }
    }    /**
     * Chuyển đổi ticket locks thành sold tickets (khi thanh toán thành công)
     * Chỉ cần giải phóng khóa vì việc tạo tickets thực tế sẽ được xử lý bởi TicketServices
     * @param ticketDetails Map<ticketClassId, quantity> cần chuyển đổi
     * @param reason Lý do chuyển đổi (để logging)
     * @return true nếu thành công, false nếu có lỗi
     */
    @Transactional
    public boolean convertLockedToSold(Map<String, Integer> ticketDetails, String reason) {
        // Thực chất chỉ cần giải phóng khóa vì tickets sẽ được tạo riêng
        return unlockTickets(ticketDetails, "Chuyển đổi thành sold - " + reason);
    }
}
