package com.ticket.servermono.ticketcontext.infrastructure.services;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for handling payment processing business logic.
 * This service delegates all status updates to PaymentStatusManager.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentProcessingService {
    
    private final PaymentStatusManager statusManager;
    
    // Store active payment simulations
    private final Map<String, Boolean> activePayments = new ConcurrentHashMap<>();
    
    /**
     * Start a mock payment processing simulation
     * @param paymentId The payment ID to simulate processing for
     */
    public void startPaymentSimulation(String paymentId) {
        // Prevent duplicate simulations
        if (activePayments.putIfAbsent(paymentId, true) != null) {
            log.info("Payment simulation already in progress for: {}", paymentId);
            return;
        }
        
        log.info("Starting payment simulation for: {}", paymentId);
        
        // Delegate to statusManager to handle the simulation and status updates
        statusManager.startPaymentSimulation(paymentId);
    }
    
    /**
     * Simulate a failed payment
     * @param paymentId The payment ID to fail
     */
    public void simulateFailedPayment(String paymentId) {
        log.info("Simulating failed payment for: {}", paymentId);
        
        // Delegate to statusManager to handle the failure
        statusManager.simulateFailedPayment(paymentId);
        
        // Remove from active payments
        activePayments.remove(paymentId);
    }
    
    /**
     * Complete payment processing and clean up
     */
    public void completePaymentProcessing(String paymentId) {
        // Remove from active payments
        activePayments.remove(paymentId);
    }
    
    /**
     * Generate a random payment ID
     * @return A unique payment ID
     */
    public String generatePaymentId() {
        return "payment_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
}