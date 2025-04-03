package com.ticket.servermono.ticketcontext.adapters.controllers;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.ticketcontext.adapters.dtos.BookingErrorResponse;
import com.ticket.servermono.ticketcontext.adapters.dtos.BookingLockRequest;
import com.ticket.servermono.ticketcontext.adapters.dtos.BookingLockResponse;
import com.ticket.servermono.ticketcontext.infrastructure.services.PaymentProcessingService;
import com.ticket.servermono.ticketcontext.infrastructure.websocket.PaymentWebSocketService;
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
    private final PaymentWebSocketService paymentWebSocketService;
    private final PaymentProcessingService paymentProcessingService;
    
    /**
     * Lock tickets for booking to prevent race conditions
     * Endpoint: POST /booking/lock
     */
    @PostMapping("/booking/lock")
    public ResponseEntity<?> lockTicketsForBooking(
            @RequestBody BookingLockRequest request,
            HttpServletRequest servletRequest) {
        try {
            log.info("Locking tickets for booking: showId={}, tickets count={}", 
                    request.getShowId(), request.getTickets().size());
            
            // Lock tickets and get payment details
            BookingLockResponse response = ticketServices.lockTicketsForBooking(request);
            
            // Register payment for WebSocket tracking
            String paymentId = paymentWebSocketService.registerPayment(response);
            
            // Ensure the response has the payment ID
            if (response.getPaymentId() == null) {
                response.setPaymentId(paymentId);
            }
            
            // Start payment simulation (will trigger WebSocket updates)
            paymentProcessingService.startPaymentSimulation(response.getPaymentId());
            
            log.info("Successfully locked tickets for booking, paymentId: {}", response.getPaymentId());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid booking request: {}", e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(createErrorResponse(HttpStatus.BAD_REQUEST, 
                            e.getMessage(), servletRequest.getRequestURI()));
                            
        } catch (IllegalStateException e) {
            log.error("Booking state error: {}", e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(createErrorResponse(HttpStatus.BAD_REQUEST, 
                            "Vé đã hết hoặc đã được đặt bởi người khác", servletRequest.getRequestURI()));
                            
        } catch (Exception e) {
            log.error("Unexpected error during booking: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                            "Có lỗi xảy ra khi xử lý đặt vé", servletRequest.getRequestURI()));
        }
    }
    
    /**
     * Helper method to create error responses
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