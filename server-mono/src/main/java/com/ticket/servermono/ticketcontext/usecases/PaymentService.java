package com.ticket.servermono.ticketcontext.usecases;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

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
import com.ticket.servermono.ticketcontext.adapters.dtos.BookingLockRequest;
import com.ticket.servermono.ticketcontext.adapters.dtos.BookingPayload;
import com.ticket.servermono.ticketcontext.domain.enums.PaymentStatus;
import com.ticket.servermono.ticketcontext.entities.Invoice;
import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.InvoiceRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;

import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;

/**
 * Service đơn giản để quản lý trạng thái thanh toán và thông báo qua WebSocket
 */
@Slf4j
@Service
public class PaymentService {

    private final PaymentStatusNotifier statusNotifier;
    private final InvoiceRepository invoiceRepository;
    private final TicketClassRepository ticketClassRepository;
    private final TicketServices ticketServices;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${app.sepayUrl}")
    private String sepayUrl;
    
    @Value("${app.sepayApiKey}")
    private String sepayApiKey;
    
    // Lưu trữ các task đang chạy để tránh trùng lặp
    private final Map<String, ScheduledFuture<?>> runningTrackers = new ConcurrentHashMap<>();
    
    // Executor để lên lịch các task
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(5);
    
    /**
     * Constructor với PaymentStatusNotifier 
     */
    public PaymentService(
            PaymentStatusNotifier statusNotifier,
            InvoiceRepository invoiceRepository,
            TicketClassRepository ticketClassRepository,
            TicketServices ticketServices,
            RestTemplate restTemplate,
            ObjectMapper objectMapper) {
        this.statusNotifier = statusNotifier;
        this.invoiceRepository = invoiceRepository;
        this.ticketClassRepository = ticketClassRepository;
        this.ticketServices = ticketServices;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }
    
    /**
     * Bắt đầu theo dõi thanh toán khi WebSocket được thiết lập
     * @param paymentId ID của thanh toán cần theo dõi
     * @param amount Số tiền thanh toán
     * @param referenceCode Mã tham chiếu để đối chiếu với giao dịch từ Sepay
     */
    public synchronized void startPaymentTracking(String paymentId, double amount, String referenceCode) {
        // Kiểm tra xem đã đang theo dõi payment này chưa
        if (runningTrackers.containsKey(paymentId)) {
            log.info("Da co tien trinh theo doi thanh toan cho paymentId={}", paymentId);
            return;
        }
        
        log.info("Bat dau theo doi thanh toan cho paymentId={}, referenceCode={}, amount={}", 
                paymentId, referenceCode, amount);
        
        // Cập nhật trạng thái ban đầu
        updatePaymentStatus(paymentId, "waiting_payment");
        
        // Lên lịch polling thanh toán trong một thread riêng
        ScheduledFuture<?> trackerTask = scheduler.scheduleAtFixedRate(
            () -> checkPaymentStatus(paymentId, amount, referenceCode),
            10, // Delay ban đầu (giây)
            10, // Khoảng thời gian giữa các lần kiểm tra (giây)
            TimeUnit.SECONDS
        );
        
        runningTrackers.put(paymentId, trackerTask);
    }

    /**
     * Kiểm tra trạng thái thanh toán
     */
    private void checkPaymentStatus(String paymentId, double amount, String referenceCode) {
        try {
            log.debug("Kiểm tra thanh toán: paymentId={}, amount={}, referenceCode={}", 
                    paymentId, amount, referenceCode);
            
            // Lấy thông tin invoice từ database
            Invoice invoice = invoiceRepository.findByPaymentId(paymentId).orElse(null);
            if (invoice == null) {
                log.warn("Không tìm thấy invoice với paymentId: {}", paymentId);
                stopPaymentTracking(paymentId);
                return;
            }
            
            // Kiểm tra xem invoice có hết hạn không
            if (invoice.getExpiresAt() != null && LocalDateTime.now().isAfter(invoice.getExpiresAt())) {
                log.info("Invoice đã hết hạn: {}", paymentId);
                invoice.setStatus(PaymentStatus.PAYMENT_EXPIRED);
                invoiceRepository.save(invoice);
                updatePaymentStatus(paymentId, "expired");
                stopPaymentTracking(paymentId);
                return;
            }
            
            // Kiểm tra nếu trạng thái đã thay đổi (không còn ở WAITING_PAYMENT)
            if (invoice.getStatus() != PaymentStatus.WAITING_PAYMENT) {
                log.info("Invoice không còn ở trạng thái chờ thanh toán: {}, status={}", 
                        paymentId, invoice.getStatus());
                updatePaymentStatus(paymentId, convertPaymentStatus(invoice.getStatus()));
                stopPaymentTracking(paymentId);
                return;
            }
            
            // Gọi API Sepay để lấy giao dịch mới nhất
            JsonNode transactionsNode = getSepayTransactions(amount);
            
            // Xử lý response khi nhận được dữ liệu từ Sepay
            if (transactionsNode != null && transactionsNode.isArray()) {
                for (JsonNode transaction : transactionsNode) {
                    if (transaction.has("code")) {
                        String code = transaction.get("code").asText();
                        
                        // So sánh mã tham chiếu
                        if (referenceCode.equals(code)) {
                            log.info("Tìm thấy giao dịch phù hợp: {}", transaction.toString());
                            processSuccessfulTransaction(paymentId, transaction);
                            return;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra thanh toán: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Dừng theo dõi thanh toán
     */
    private void stopPaymentTracking(String paymentId) {
        ScheduledFuture<?> future = runningTrackers.remove(paymentId);
        if (future != null && !future.isDone()) {
            future.cancel(false);
            log.info("Đã dừng theo dõi thanh toán cho: {}", paymentId);
        }
    }
    
    /**
     * Chuyển đổi PaymentStatus sang string
     */
    private String convertPaymentStatus(PaymentStatus status) {
        switch (status) {
            case WAITING_PAYMENT:
                return "waiting_payment";
            case PAYMENT_SUCCESS:
                return "payment_received";
            case PAYMENT_FAILED:
                return "failed";
            case PAYMENT_EXPIRED:
                return "expired";
            case PAYMENT_CANCELLED:
                return "cancelled";
            default:
                return "unknown";
        }
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
            
            // Chuyển sang trạng thái processing
            updatePaymentStatus(paymentId, "processing");
            
            try {
                // Cập nhật invoice thành PAYMENT_SUCCESS
                invoice.setStatus(PaymentStatus.PAYMENT_SUCCESS);
                invoiceRepository.save(invoice);
                log.info("Đã cập nhật invoice thành PAYMENT_SUCCESS: {}", paymentId);
                
                // Lấy thông tin từ invoice để tạo vé
                UUID userId = invoice.getUserId();
                UUID showId = invoice.getShowId();
                
                if (userId != null && showId != null) {
                    try {
                        // Chuyển BookingLockRequest sang BookingPayload để tạo vé
                        List<BookingLockRequest.TicketItem> ticketItems = getTicketItemsFromInvoice(paymentId);
                        if (ticketItems != null && !ticketItems.isEmpty()) {
                            BookingPayload payload = createBookingPayload(showId, ticketItems);
                            
                            // Tạo vé cho người dùng
                            log.info("Bắt đầu tạo vé cho userId: {}, showId: {}", userId, showId);
                            ticketServices.bookTicket(payload, userId);
                            log.info("Đã tạo vé thành công cho userId: {}, showId: {}", userId, showId);
                            
                            // Giải phóng (xóa) khóa vé
                            releaseTicketLocks(ticketItems);
                        }
                    } catch (Exception e) {
                        log.error("Lỗi khi tạo vé sau thanh toán: {}", e.getMessage(), e);
                    }
                } else {
                    log.warn("Không tìm thấy userId hoặc showId trong invoice: {}", paymentId);
                }
                
                // Delay 2 giây sau đó chuyển sang trạng thái completed
                scheduler.schedule(() -> {
                    updatePaymentStatus(paymentId, "completed");
                }, 2, TimeUnit.SECONDS);
            } catch (Exception e) {
                log.error("Lỗi khi cập nhật trạng thái invoice: {}", e.getMessage(), e);
                updatePaymentStatus(paymentId, "failed");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý giao dịch thành công: {}", e.getMessage(), e);
            updatePaymentStatus(paymentId, "failed");
        }
    }
    
    /**
     * Lấy danh sách TicketItem từ database dựa trên paymentId
     */
    private List<BookingLockRequest.TicketItem> getTicketItemsFromInvoice(String paymentId) {
        try {
            // Lấy invoice theo paymentId
            Invoice invoice = invoiceRepository.findByPaymentId(paymentId).orElse(null);
            if (invoice == null) {
                log.warn("Không tìm thấy invoice với paymentId: {}", paymentId);
                return new ArrayList<>();
            }
            
            // Lấy thông tin chi tiết vé từ invoice.ticketDetails
            Map<String, Integer> ticketDetails = invoice.getTicketDetails();
            if (ticketDetails == null || ticketDetails.isEmpty()) {
                log.warn("Không có thông tin chi tiết vé trong invoice: {}", paymentId);
                return new ArrayList<>();
            }
            
            // Chuyển đổi map thành danh sách TicketItem
            List<BookingLockRequest.TicketItem> items = new ArrayList<>();
            
            for (Map.Entry<String, Integer> entry : ticketDetails.entrySet()) {
                String ticketClassId = entry.getKey();
                Integer quantity = entry.getValue();
                
                if (quantity <= 0) continue;
                
                // Lấy thông tin tên loại vé từ database
                try {
                    UUID ticketClassUUID = UUID.fromString(ticketClassId);
                    TicketClass ticketClass = ticketClassRepository.findById(ticketClassUUID).orElse(null);
                    
                    if (ticketClass != null) {
                        BookingLockRequest.TicketItem item = new BookingLockRequest.TicketItem();
                        item.setId(ticketClassId);
                        item.setType(ticketClass.getName());
                        item.setQuantity(quantity);
                        items.add(item);
                    }
                } catch (IllegalArgumentException e) {
                    log.error("ID vé không hợp lệ trong ticketDetails: {}", ticketClassId);
                }
            }
            
            return items;
                
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin chi tiết vé từ invoice: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Tạo BookingPayload từ danh sách TicketItem
     */
    private BookingPayload createBookingPayload(UUID showId, List<BookingLockRequest.TicketItem> ticketItems) {
        List<BookingPayload.TicketPayload> tickets = ticketItems.stream()
            .map(item -> BookingPayload.TicketPayload.builder()
                .id(UUID.fromString(item.getId()))
                .type(item.getType())
                .quantity(item.getQuantity())
                .build())
            .collect(Collectors.toList());
            
        return BookingPayload.builder()
            .showId(showId)
            .tickets(tickets)
            .build();
    }
    
    /**
     * Giải phóng khóa vé sau khi đã tạo vé thành công
     */
    private void releaseTicketLocks(List<BookingLockRequest.TicketItem> ticketItems) {
        try {
            for (BookingLockRequest.TicketItem item : ticketItems) {
                UUID ticketClassId = UUID.fromString(item.getId());
                Optional<TicketClass> ticketClassOpt = ticketClassRepository.findById(ticketClassId);
                
                if (ticketClassOpt.isPresent()) {
                    TicketClass ticketClass = ticketClassOpt.get();
                    // Đảm bảo không đặt lockedCapacity thành số âm
                    int newLockedCapacity = Math.max(0, ticketClass.getLockedCapacity() - item.getQuantity());
                    ticketClass.setLockedCapacity(newLockedCapacity);
                    ticketClassRepository.save(ticketClass);
                    log.info("Đã giải phóng khóa {} vé cho hạng vé {}", item.getQuantity(), ticketClass.getName());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi giải phóng khóa vé: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Cập nhật trạng thái thanh toán và thông báo
     */
    public void updatePaymentStatus(String paymentId, String status) {
        log.info("Cập nhật trạng thái thanh toán: paymentId={}, status={}", paymentId, status);
        statusNotifier.sendPaymentStatusUpdate(paymentId, status);
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