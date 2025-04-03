package com.ticket.servermono.ticketcontext.infrastructure.services;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.ticket.servermono.ticketcontext.adapters.websocket.PaymentStatusWebSocketHandler;

import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service đơn giản để quản lý trạng thái thanh toán và thông báo qua WebSocket
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentStatusWebSocketHandler webSocketHandler;
    
    // Lưu trữ trạng thái thanh toán
    private final Map<String, String> paymentStatuses = new ConcurrentHashMap<>();
    
    // Lưu trữ các task theo lịch
    private final Map<String, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();
    
    // Executor để lên lịch các task
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    /**
     * Đăng ký một thanh toán mới và tạo ID
     */
    public String registerPayment(String paymentId) {
        log.info("Đăng ký thanh toán mới: {}", paymentId);
        return paymentId;
    }
    
    /**
     * Cập nhật trạng thái thanh toán và thông báo qua WebSocket
     */
    public void updatePaymentStatus(String paymentId, String status) {
        // Cập nhật trạng thái
        paymentStatuses.put(paymentId, status);
        log.info("Đã cập nhật trạng thái thanh toán: paymentId={}, status={}", paymentId, status);
        
        // Gửi cập nhật qua WebSocket
        webSocketHandler.sendPaymentStatusUpdate(paymentId, status);
    }
    
    /**
     * Lấy trạng thái thanh toán hiện tại
     */
    public String getPaymentStatus(String paymentId) {
        return paymentStatuses.getOrDefault(paymentId, "unknown");
    }
    
    /**
     * Bắt đầu mô phỏng tiến trình thanh toán (ví dụ: chờ thanh toán → đã nhận thanh toán → đang xử lý → hoàn thành)
     */
    public void startPaymentSimulation(String paymentId) {
        // Hủy các task đã lên lịch trước đó (nếu có)
        cancelScheduledTasks(paymentId);
        
        // Cập nhật trạng thái ban đầu
        updatePaymentStatus(paymentId, "waiting_payment");
        
        // Lên lịch các trạng thái tiếp theo
        ScheduledFuture<?> future = scheduler.schedule(() -> {
            // Cập nhật: đã nhận thanh toán
            updatePaymentStatus(paymentId, "payment_received");
            
            // Lên lịch trạng thái tiếp theo
            scheduler.schedule(() -> {
                // Cập nhật: đang xử lý
                updatePaymentStatus(paymentId, "processing");
                
                // Lên lịch trạng thái cuối cùng
                scheduler.schedule(() -> {
                    // Cập nhật: hoàn thành
                    updatePaymentStatus(paymentId, "completed");
                }, 3, TimeUnit.SECONDS);
            }, 5, TimeUnit.SECONDS);
        }, 10, TimeUnit.SECONDS);
        
        // Lưu task để có thể hủy sau này nếu cần
        scheduledTasks.put(paymentId, future);
    }
    
    /**
     * Mô phỏng thanh toán thất bại
     */
    public void simulateFailedPayment(String paymentId) {
        // Hủy các task đã lên lịch
        cancelScheduledTasks(paymentId);
        
        // Cập nhật trạng thái thất bại
        updatePaymentStatus(paymentId, "failed");
    }
    
    /**
     * Hủy các task đã lên lịch
     */
    private void cancelScheduledTasks(String paymentId) {
        ScheduledFuture<?> future = scheduledTasks.remove(paymentId);
        if (future != null && !future.isDone()) {
            future.cancel(false);
            log.debug("Đã hủy các task theo lịch cho thanh toán: {}", paymentId);
        }
    }
    
    /**
     * Dọn dẹp tài nguyên khi ứng dụng đóng
     */
    @PreDestroy
    public void cleanup() {
        scheduler.shutdownNow();
        log.info("Đã dọn dẹp tài nguyên PaymentService");
    }
}