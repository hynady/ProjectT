package com.ticket.servermono.ticketcontext.adapters.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.ticketcontext.infrastructure.services.PaymentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/payment")
public class PaymentStatusController {

    private final PaymentService paymentService;
    
    /**
     * Lấy trạng thái hiện tại của một thanh toán
     */
    @GetMapping("/status/{paymentId}")
    public ResponseEntity<String> getPaymentStatus(@PathVariable String paymentId) {
        String status = paymentService.getPaymentStatus(paymentId);
        return ResponseEntity.ok(status);
    }
    
    /**
     * Cập nhật trạng thái thanh toán thủ công (dùng để kiểm thử)
     */
    @PostMapping("/status/{paymentId}")
    public ResponseEntity<String> updatePaymentStatus(
            @PathVariable String paymentId,
            @RequestParam String status) {
        
        log.info("Yêu cầu cập nhật trạng thái thủ công: paymentId={}, status={}", paymentId, status);
        paymentService.updatePaymentStatus(paymentId, status);
        
        return ResponseEntity.ok("Đã cập nhật trạng thái thành: " + status);
    }
    
    /**
     * Bắt đầu mô phỏng thanh toán thành công
     */
    @PostMapping("/simulate/success/{paymentId}")
    public ResponseEntity<String> simulateSuccessfulPayment(@PathVariable String paymentId) {
        log.info("Bắt đầu mô phỏng thanh toán thành công cho ID: {}", paymentId);
        paymentService.startPaymentSimulation(paymentId);
        
        return ResponseEntity.ok("Đã bắt đầu mô phỏng thanh toán");
    }
    
    /**
     * Mô phỏng thanh toán thất bại
     */
    @PostMapping("/simulate/failure/{paymentId}")
    public ResponseEntity<String> simulateFailedPayment(@PathVariable String paymentId) {
        log.info("Mô phỏng thanh toán thất bại cho ID: {}", paymentId);
        paymentService.simulateFailedPayment(paymentId);
        
        return ResponseEntity.ok("Đã mô phỏng thanh toán thất bại");
    }
}