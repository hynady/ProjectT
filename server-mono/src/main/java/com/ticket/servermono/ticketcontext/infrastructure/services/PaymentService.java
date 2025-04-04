package com.ticket.servermono.ticketcontext.infrastructure.services;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.servermono.ticketcontext.adapters.websocket.PaymentStatusWebSocketHandler;
import com.ticket.servermono.ticketcontext.domain.enums.PaymentStatus;
import com.ticket.servermono.ticketcontext.entities.Invoice;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.InvoiceRepository;

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
    private final InvoiceRepository invoiceRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${app.sepayUrl}")
    private String sepayUrl;
    
    @Value("${app.sepayApiKey}")
    private String sepayApiKey;
    
    // Lưu trữ trạng thái thanh toán
    private final Map<String, String> paymentStatuses = new ConcurrentHashMap<>();
    
    // Lưu trữ các task theo lịch
    private final Map<String, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();
    
    // Executor để lên lịch các task
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    /**
     * Bắt đầu theo dõi thanh toán qua Sepay
     * @param paymentId ID của thanh toán cần theo dõi
     * @param amount Số tiền thanh toán
     * @param referenceCode Mã tham chiếu để đối chiếu với giao dịch từ Sepay
     */
    public void startPaymentTracking(String paymentId, double amount, String referenceCode) {
        log.info("Bắt đầu theo dõi thanh toán với Sepay: paymentId={}, amount={}, referenceCode={}",
                paymentId, amount, referenceCode);
        
        // Hủy các task đã lên lịch trước đó (nếu có)
        cancelScheduledTasks(paymentId);
        
        // Cập nhật trạng thái ban đầu
        updatePaymentStatus(paymentId, "waiting_payment");
        
        // Bắt đầu polling thanh toán trong một thread riêng
        ScheduledFuture<?> future = scheduler.schedule(() -> {
            pollSepayForPayment(paymentId, amount, referenceCode);
        }, 0, TimeUnit.SECONDS);
        
        scheduledTasks.put(paymentId, future);
    }
    
    /**
     * Lấy danh sách giao dịch từ Sepay API
     * @param amount Số tiền cần lọc
     * @return Danh sách giao dịch (JsonNode)
     */
    private JsonNode getSepayTransactions(double amount) {
        try {
            // Ngày hiện tại theo định dạng yyyy-MM-dd
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            
            // Xây dựng URL với các tham số
            String url = UriComponentsBuilder.fromUriString(sepayUrl + "/userapi/transactions/list")
                    .queryParam("transaction_date_min", today)
                    .queryParam("amount_in", String.format("%.2f", amount))
                    .build()
                    .toUriString();
            
            log.debug("Gọi API Sepay: {}", url);
            
            // Thiết lập headers với Bearer token
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(sepayApiKey);
            
            // Gọi API
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class);
            
            // Parse JSON response
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            
            // Kiểm tra response status
            if (rootNode.has("status") && rootNode.get("status").asInt() == 200 
                    && rootNode.has("messages") && rootNode.path("messages").has("success") 
                    && rootNode.path("messages").get("success").asBoolean()) {
                
                if (rootNode.has("transactions")) {
                    return rootNode.get("transactions");
                } else {
                    log.warn("API Sepay không trả về transactions");
                }
            } else {
                log.warn("API Sepay trả về lỗi: {}", response.getBody());
            }
        } catch (Exception e) {
            log.error("Lỗi khi gọi API Sepay: {}", e.getMessage(), e);
        }
        
        return null;
    }
    
    /**
     * Xử lý khi tìm thấy giao dịch thành công
     * @param paymentId ID thanh toán
     * @param transaction Thông tin giao dịch từ Sepay
     */
    @Transactional
    private void processSuccessfulTransaction(String paymentId, JsonNode transaction) {
        try {
            // Cập nhật trạng thái: đã nhận thanh toán
            updatePaymentStatus(paymentId, "payment_received");
            
            // Tìm invoice theo paymentId
            Invoice invoice = invoiceRepository.findByPaymentId(paymentId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy invoice cho paymentId: " + paymentId));
            
            // Delay 2 giây sau đó chuyển sang trạng thái processing
            scheduler.schedule(() -> {
                updatePaymentStatus(paymentId, "processing");
                
                try {
                    // Cập nhật invoice thành PAYMENT_SUCCESS
                    invoice.setStatus(PaymentStatus.PAYMENT_SUCCESS);
                    invoiceRepository.save(invoice);
                    log.info("Đã cập nhật invoice thành PAYMENT_SUCCESS: {}", paymentId);
                    
                    // Delay 2 giây sau đó chuyển sang trạng thái completed
                    scheduler.schedule(() -> {
                        updatePaymentStatus(paymentId, "completed");
                    }, 2, TimeUnit.SECONDS);
                } catch (Exception e) {
                    log.error("Lỗi khi cập nhật trạng thái invoice: {}", e.getMessage(), e);
                    updatePaymentStatus(paymentId, "failed");
                }
            }, 2, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("Lỗi khi xử lý giao dịch thành công: {}", e.getMessage(), e);
            updatePaymentStatus(paymentId, "failed");
        }
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
    
    /**
     * Polling API Sepay để kiểm tra giao dịch thực tế
     */
    private void pollSepayForPayment(String paymentId, double amount, String referenceCode) {
        log.info("Bắt đầu kiểm tra thanh toán với Sepay cho ID: {}, Số tiền: {}, Mã tham chiếu: {}", 
                paymentId, amount, referenceCode);
        
        // Số lần retry tối đa (3 phút, mỗi 10 giây kiểm tra một lần = 18 lần)
        int maxRetries = 18;
        int retryCount = 0;
        boolean transactionFound = false;
        
        while (retryCount < maxRetries && !transactionFound) {
            try {
                // Gọi API Sepay để lấy giao dịch mới nhất
                JsonNode transactionsNode = getSepayTransactions(amount);
                
                // Xử lý response khi nhận được dữ liệu từ Sepay
                if (transactionsNode != null && transactionsNode.isArray()) {
                    log.debug("Nhận được {} giao dịch từ Sepay", transactionsNode.size());
                    
                    // Lặp qua các giao dịch để tìm giao dịch phù hợp
                    for (JsonNode transaction : transactionsNode) {
                        if (transaction.has("code")) {
                            String code = transaction.get("code").asText();
                            
                            // So sánh mã tham chiếu
                            if (referenceCode.equals(code)) {
                                log.info("Tìm thấy giao dịch phù hợp: {}", transaction.toString());
                                
                                // Ghi log thông tin giao dịch để debug
                                if (transaction.has("transaction_content")) {
                                    log.info("Nội dung giao dịch: {}", transaction.get("transaction_content").asText());
                                }
                                if (transaction.has("amount_in")) {
                                    log.info("Số tiền nhận được: {}", transaction.get("amount_in").asText());
                                }
                                if (transaction.has("transaction_date")) {
                                    log.info("Thời gian giao dịch: {}", transaction.get("transaction_date").asText());
                                }
                                
                                transactionFound = true;
                                
                                // Xử lý giao dịch thành công
                                processSuccessfulTransaction(paymentId, transaction);
                                break;
                            }
                        }
                    }
                } else {
                    log.warn("Không nhận được dữ liệu giao dịch hợp lệ từ Sepay");
                }
                
                if (!transactionFound) {
                    // Tăng số lần thử và đợi trước khi thử lại
                    retryCount++;
                    log.debug("Không tìm thấy giao dịch, thử lại lần {}/{}", retryCount, maxRetries);
                    
                    if (retryCount < maxRetries) {
                        Thread.sleep(10000); // Đợi 10 giây trước khi thử lại
                    }
                }
            } catch (Exception e) {
                log.error("Lỗi khi kiểm tra thanh toán với Sepay: {}", e.getMessage(), e);
                retryCount++;
                
                try {
                    if (retryCount < maxRetries) {
                        Thread.sleep(10000); // Đợi 10 giây trước khi thử lại
                    }
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    log.error("Luồng bị ngắt khi đợi thử lại: {}", ie.getMessage());
                    break;
                }
            }
        }
        
        // Xử lý trường hợp không tìm thấy giao dịch sau khi đã thử hết số lần
        if (!transactionFound) {
            log.warn("Không tìm thấy giao dịch sau {} lần thử, thanh toán thất bại: {}", maxRetries, paymentId);
            updatePaymentStatus(paymentId, "failed");
        }
    }
}