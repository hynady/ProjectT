package com.ticket.servermono.ticketcontext.adapters.controllers;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.ticketcontext.adapters.dtos.BookingErrorResponse;
import com.ticket.servermono.ticketcontext.adapters.dtos.BookingLockRequest;
import com.ticket.servermono.ticketcontext.adapters.dtos.BookingLockResponse;
import com.ticket.servermono.ticketcontext.infrastructure.services.PaymentService;
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
    private final PaymentService paymentService;
    
    /**
     * Khóa vé để đặt, ngăn chặn tình trạng đặt trùng
     * Endpoint: POST /booking/lock
     */
    @PostMapping("/booking/lock")
    public ResponseEntity<?> lockTicketsForBooking(
            @RequestBody BookingLockRequest request,
            HttpServletRequest servletRequest) {
        try {
            log.info("Đang khóa vé để đặt: showId={}, số lượng vé={}", 
                    request.getShowId(), request.getTickets().size());
            
            // Khóa vé và lấy thông tin thanh toán
            BookingLockResponse response = ticketServices.lockTicketsForBooking(request);
            
            // Đảm bảo response có paymentId
            if (response.getPaymentId() == null) {
                response.setPaymentId("payment_" + UUID.randomUUID().toString());
            }
            
            // Đăng ký thanh toán và bắt đầu mô phỏng
            paymentService.registerPayment(response.getPaymentId());
            paymentService.startPaymentSimulation(response.getPaymentId());
            
            log.info("Đã khóa vé thành công, paymentId: {}", response.getPaymentId());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Yêu cầu đặt vé không hợp lệ: {}", e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(createErrorResponse(HttpStatus.BAD_REQUEST, 
                            e.getMessage(), servletRequest.getRequestURI()));
                            
        } catch (IllegalStateException e) {
            log.error("Lỗi trạng thái đặt vé: {}", e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(createErrorResponse(HttpStatus.BAD_REQUEST, 
                            "Vé đã hết hoặc đã được đặt bởi người khác", servletRequest.getRequestURI()));
                            
        } catch (Exception e) {
            log.error("Lỗi không mong đợi khi đặt vé: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                            "Có lỗi xảy ra khi xử lý đặt vé", servletRequest.getRequestURI()));
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