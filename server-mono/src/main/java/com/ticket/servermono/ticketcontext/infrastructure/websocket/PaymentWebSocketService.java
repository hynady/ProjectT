package com.ticket.servermono.ticketcontext.infrastructure.websocket;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ticket.servermono.ticketcontext.adapters.dtos.BookingLockResponse;
import com.ticket.servermono.ticketcontext.infrastructure.services.PaymentStatusManager;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing WebSocket-related payment operations.
 * This class delegates all status management to PaymentStatusManager.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentWebSocketService {
    
    private final PaymentStatusManager statusManager;
    
    /**
     * Update payment status for a specific payment ID
     */
    public void updatePaymentStatus(String paymentId, String status) {
        log.info("Payment status update requested: paymentId={}, status={}", paymentId, status);
        
        // Delegate to the status manager (single source of truth)
        statusManager.updatePaymentStatus(paymentId, status);
    }
    
    /**
     * Register a new payment for WebSocket tracking
     * Returns the payment ID that clients can use to connect to WebSocket
     */
    public String registerPayment(BookingLockResponse paymentDetails) {
        // Generate a unique payment ID if it's not already present
        String paymentId = paymentDetails.getPaymentId() != null ? 
                paymentDetails.getPaymentId() : 
                "payment_" + UUID.randomUUID().toString();
        
        log.info("Registered new payment for WebSocket tracking: paymentId={}", paymentId);
        
        return paymentId;
    }
    
    /**
     * Get the current status of a payment
     */
    public String getPaymentStatus(String paymentId) {
        return statusManager.getPaymentStatus(paymentId);
    }
    
    /**
     * Manually trigger payment status update for testing
     */
    public void triggerStatusUpdate(String paymentId, String status) {
        log.info("Manual status update triggered: paymentId={}, status={}", paymentId, status);
        
        // Delegate to the status manager (single source of truth)
        statusManager.updatePaymentStatus(paymentId, status);
    }
}