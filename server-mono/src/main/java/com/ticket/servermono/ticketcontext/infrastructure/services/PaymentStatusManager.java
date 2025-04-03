package com.ticket.servermono.ticketcontext.infrastructure.services;

import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.ticket.servermono.ticketcontext.infrastructure.websocket.PaymentWebSocketHandler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Central authority for payment status management.
 * This class is the ONLY place that should update payment statuses.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentStatusManager {
    
    private final PaymentWebSocketHandler webSocketHandler;
    
    // Map to track current status of each payment
    private final Map<String, String> paymentStatuses = new ConcurrentHashMap<>();
    
    // Map to store scheduled tasks for each payment
    private final Map<String, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();
    
    // Thread pool for scheduling tasks
    private final ScheduledExecutorService scheduler = new ScheduledThreadPoolExecutor(1);
    
    /**
     * Update the status of a payment and notify connected clients.
     * This is the SINGLE source of truth for payment status changes.
     * 
     * @param paymentId The payment ID
     * @param newStatus The new status to set
     * @return true if the status was updated, false if it was already set to that status
     */
    public boolean updatePaymentStatus(String paymentId, String newStatus) {
        // No status update if new status is the same as current
        String currentStatus = paymentStatuses.get(paymentId);
        if (Objects.equals(currentStatus, newStatus)) {
            log.debug("Payment status already set to {}, ignoring update: {}", newStatus, paymentId);
            return false;
        }
        
        // Update the stored status
        paymentStatuses.put(paymentId, newStatus);
        log.info("Payment status updated: paymentId={}, status={} (was: {})", 
                paymentId, newStatus, currentStatus);
        
        // Notify connected clients via WebSocket
        if (webSocketHandler.hasActiveSession(paymentId)) {
            webSocketHandler.sendPaymentStatus(paymentId, newStatus);
        }
        
        return true;
    }
    
    /**
     * Get the current status of a payment
     */
    public String getPaymentStatus(String paymentId) {
        return paymentStatuses.getOrDefault(paymentId, "unknown");
    }
    
    /**
     * Start the payment simulation with automatic status transitions
     */
    public void startPaymentSimulation(String paymentId) {
        // Cancel any existing simulation
        cancelScheduledTasks(paymentId);
        
        // Set initial status
        updatePaymentStatus(paymentId, "waiting_payment");
        
        // Schedule payment received status after 10 seconds
        ScheduledFuture<?> task = scheduler.schedule(() -> {
            updatePaymentStatus(paymentId, "payment_received");
            
            // Schedule processing status after 5 more seconds
            scheduler.schedule(() -> {
                updatePaymentStatus(paymentId, "processing");
                
                // Schedule completed status after 3 more seconds
                scheduler.schedule(() -> {
                    updatePaymentStatus(paymentId, "completed");
                }, 3, TimeUnit.SECONDS);
            }, 5, TimeUnit.SECONDS);
        }, 10, TimeUnit.SECONDS);
        
        // Store the task reference
        scheduledTasks.put(paymentId, task);
    }
    
    /**
     * Simulate a failed payment
     */
    public void simulateFailedPayment(String paymentId) {
        // Cancel any scheduled status updates
        cancelScheduledTasks(paymentId);
        
        // Set the status to failed
        updatePaymentStatus(paymentId, "failed");
    }
    
    /**
     * Cancel scheduled tasks for a payment
     */
    private void cancelScheduledTasks(String paymentId) {
        ScheduledFuture<?> task = scheduledTasks.remove(paymentId);
        if (task != null && !task.isDone()) {
            task.cancel(false);
            log.debug("Cancelled scheduled tasks for payment: {}", paymentId);
        }
    }
    
    /**
     * Clean up resources for a payment
     */
    public void cleanupPayment(String paymentId) {
        cancelScheduledTasks(paymentId);
        paymentStatuses.remove(paymentId);
        log.info("Cleaned up payment resources: {}", paymentId);
    }
}