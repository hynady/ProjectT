package com.ticket.servermono.ticketcontext.adapters.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.ticketcontext.infrastructure.websocket.PaymentWebSocketService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/admin")
public class PaymentStatusController {

    private final PaymentWebSocketService paymentWebSocketService;
    
    /**
     * Endpoint for manual testing of payment status updates
     */
    @PostMapping("/payments/{paymentId}/status")
    public ResponseEntity<String> updatePaymentStatus(
            @PathVariable("paymentId") String paymentId,
            @RequestParam("status") String status) {
        
        log.info("Manually triggering payment status update: paymentId={}, status={}", paymentId, status);
        
        // Validate status
        if (!isValidStatus(status)) {
            return ResponseEntity.badRequest()
                    .body("Invalid status. Valid values: waiting_payment, payment_received, processing, completed, failed");
        }
        
        // Trigger the status update
        paymentWebSocketService.triggerStatusUpdate(paymentId, status);
        
        return ResponseEntity.ok("Payment status updated to: " + status);
    }
    
    private boolean isValidStatus(String status) {
        return status.equals("waiting_payment") ||
               status.equals("payment_received") ||
               status.equals("processing") ||
               status.equals("completed") ||
               status.equals("failed");
    }
}