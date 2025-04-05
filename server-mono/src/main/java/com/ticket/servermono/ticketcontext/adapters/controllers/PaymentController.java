package com.ticket.servermono.ticketcontext.adapters.controllers;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.ticketcontext.adapters.dtos.BookingErrorResponse;
import com.ticket.servermono.ticketcontext.usecases.TicketServices;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller để quản lý các hoạt động liên quan đến thanh toán
 */
@Slf4j
@RestController
@RequestMapping("/v1/payment")
@RequiredArgsConstructor
public class PaymentController {
    
    private final TicketServices ticketServices;
    
    /**
     * Endpoint để lấy thông tin thanh toán (số tài khoản, ngân hàng)
     * @param paymentId ID của thanh toán
     * @return Thông tin thanh toán
     */
    @GetMapping("/info/{paymentId}")
    public ResponseEntity<?> getPaymentInfo(
            @PathVariable String paymentId,
            @Nullable Principal principal,
            HttpServletRequest servletRequest) {
            
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401)
                    .body(createErrorResponse(HttpStatus.UNAUTHORIZED, 
                            "Yêu cầu đăng nhập để xem thông tin thanh toán", servletRequest.getRequestURI()));
        }
        
        try {
            UUID.fromString(principal.getName()); // Kiểm tra UUID hợp lệ
            
            Map<String, Object> paymentInfo = ticketServices.getPaymentInfo(paymentId);
            return ResponseEntity.ok(paymentInfo);
            
        } catch (EntityNotFoundException e) {
            log.warn("Không tìm thấy thông tin thanh toán: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(HttpStatus.NOT_FOUND, 
                            e.getMessage(), servletRequest.getRequestURI()));
        } catch (IllegalStateException e) {
            log.warn("Trạng thái không hợp lệ: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(HttpStatus.BAD_REQUEST, 
                            e.getMessage(), servletRequest.getRequestURI()));
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin thanh toán: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                            "Lỗi khi lấy thông tin thanh toán", servletRequest.getRequestURI()));
        }
    }
    
    /**
     * Endpoint để lấy chi tiết hóa đơn
     * @param paymentId ID của thanh toán
     * @return Chi tiết hóa đơn
     */
    @GetMapping("/invoice/{paymentId}")
    public ResponseEntity<?> getInvoiceDetails(
            @PathVariable String paymentId,
            @Nullable Principal principal,
            HttpServletRequest servletRequest) {
            
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401)
                    .body(createErrorResponse(HttpStatus.UNAUTHORIZED, 
                            "Yêu cầu đăng nhập để xem chi tiết hóa đơn", servletRequest.getRequestURI()));
        }
        
        try {
            UUID.fromString(principal.getName()); // Kiểm tra UUID hợp lệ
            
            Map<String, Object> invoiceDetails = ticketServices.getInvoiceDetails(paymentId);
            return ResponseEntity.ok(invoiceDetails);
            
        } catch (EntityNotFoundException e) {
            log.warn("Không tìm thấy chi tiết hóa đơn: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(HttpStatus.NOT_FOUND, 
                            e.getMessage(), servletRequest.getRequestURI()));
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết hóa đơn: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                            "Lỗi khi lấy chi tiết hóa đơn", servletRequest.getRequestURI()));
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