package com.ticket.servermono.ticketcontext.adapters.controllers;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.ticketcontext.adapters.dtos.BookingErrorResponse;
import com.ticket.servermono.ticketcontext.adapters.dtos.BookingLockRequest;
import com.ticket.servermono.ticketcontext.adapters.dtos.BookingLockResponse;
import com.ticket.servermono.ticketcontext.entities.Invoice;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.InvoiceRepository;
import com.ticket.servermono.ticketcontext.usecases.TicketServices;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1")
public class BookingLockController {
    
    private final TicketServices ticketServices;
    private final InvoiceRepository invoiceRepository;
    
    /**
     * Khóa vé để đặt, ngăn chặn tình trạng đặt trùng
     * Endpoint: POST /booking/lock
     * Chỉ lock vé, không bắt đầu theo dõi thanh toán
     */
    @PostMapping("/booking/lock")
    public ResponseEntity<?> lockTicketsForBooking(
            @RequestBody BookingLockRequest request,
            HttpServletRequest servletRequest,
            @Nullable Principal principal) {
        try {
            // Check if user is authenticated
            if (principal == null || principal.getName() == null) {
                return ResponseEntity.status(401).body("Authentication required for booking");
            }
            
            UUID userId = UUID.fromString(principal.getName());
            log.info("Dang khoa ve de dat: showId={}, so luong ve={}, userId={}", 
                    request.getShowId(), request.getTickets().size(), userId);
            
            // Chỉ khóa vé và lấy thông tin thanh toán, không bắt đầu theo dõi
            BookingLockResponse response = ticketServices.lockTicketsForBooking(request);
            
            log.info("Da khoa ve thanh cong, paymentId: {}", response.getPaymentId());
            
            // Lưu userId vào invoice cho việc sử dụng sau này
            Optional<Invoice> invoiceOpt = invoiceRepository.findByPaymentId(response.getPaymentId());
            if (invoiceOpt.isPresent()) {
                Invoice invoice = invoiceOpt.get();
                invoice.setUserId(userId);
                invoiceRepository.save(invoice);
            }

            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Yeu cau dat ve khong hop le: {}", e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(createErrorResponse(HttpStatus.BAD_REQUEST, 
                            e.getMessage(), servletRequest.getRequestURI()));
                            
        } catch (IllegalStateException e) {
            log.error("Loi trang thai dat ve: {}", e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(createErrorResponse(HttpStatus.BAD_REQUEST, 
                            "Ve da het hoac da duoc dat boi nguoi khac", servletRequest.getRequestURI()));
                            
        } catch (Exception e) {
            log.error("Loi khong mong doi khi dat ve: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                            "Co loi xay ra khi xu ly dat ve", servletRequest.getRequestURI()));
        }
    }
    
    /**
     * Tạo response lỗi
     */
    private BookingErrorResponse createErrorResponse(HttpStatus status, String message, String path) {
        return BookingErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .build();
    }
}