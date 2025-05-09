package com.ticket.servermono.ticketcontext.usecases;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.occacontext.adapters.dtos.organizer.DailyVisitorsItem;
import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.entities.OccaTrackingStats;
import com.ticket.servermono.ticketcontext.adapters.dtos.AddTicketClassRequest;
import com.ticket.servermono.ticketcontext.adapters.dtos.BookingLockRequest;
import com.ticket.servermono.ticketcontext.adapters.dtos.BookingLockResponse;
import com.ticket.servermono.ticketcontext.adapters.dtos.BookingPayload;
import com.ticket.servermono.ticketcontext.adapters.dtos.DailyRevenueItem;
import com.ticket.servermono.ticketcontext.adapters.dtos.ListTicketsResponse;
import com.ticket.servermono.ticketcontext.adapters.dtos.RevenueOverviewResponse;
import com.ticket.servermono.ticketcontext.adapters.dtos.RevenueOverviewResponse.Period;
import com.ticket.servermono.ticketcontext.adapters.dtos.RevenueOverviewResponse.RevenueDistributionItem;
import com.ticket.servermono.ticketcontext.adapters.dtos.TicketClassResponse;
import com.ticket.servermono.ticketcontext.domain.enums.PaymentStatus;
import com.ticket.servermono.ticketcontext.entities.Invoice;
import com.ticket.servermono.ticketcontext.entities.PaymentInfo;
import com.ticket.servermono.ticketcontext.entities.Ticket;
import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.grpc.OccaCreatorGrpcClient;
import com.ticket.servermono.ticketcontext.grpc.OccaGrpcClient;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.InvoiceRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.PaymentInfoRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import occa.OccaDataResponse;
import occa.OccaResquest;
import occa.ShowDataResponse;
import user.UserExistsRequest;
import user.UserServiceGrpc;
import org.springframework.kafka.core.KafkaTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketServices {
    private static final String TICKET_BOOKING_TOPIC = "ticket.booking.stats";
    
    private final TicketClassRepository ticketClassRepository;
    private final TicketRepository ticketRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentInfoRepository paymentInfoRepository;
    private final OccaGrpcClient occaGrpcClient;
    private final OccaCreatorGrpcClient occaCreatorGrpcClient;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @GrpcClient("user-service")
    private UserServiceGrpc.UserServiceBlockingStub userStub;

    public int calculateAvailableTickets(TicketClass ticketClass) {
        Long soldTickets = ticketRepository.countByTicketClassId(ticketClass.getId());
        // Subtract both sold tickets and locked tickets from capacity
        return ticketClass.getCapacity() - soldTickets.intValue() - ticketClass.getLockedCapacity();
    }

    @Transactional
    boolean isSoldOut(TicketClass ticketClass) {
        return calculateAvailableTickets(ticketClass) == 0;
    }

    @Transactional
    public void sellTicket(UUID ticketClassId) {
        try {
            // check if ticket class exists
            TicketClass ticketClass = ticketClassRepository.findById(ticketClassId)
                    .orElseThrow(() -> new IllegalStateException("Ticket class not found"));
            // check if ticket is available
            if (isSoldOut(ticketClass)) {
                throw new IllegalStateException("Ticket class is sold out");
            }
            // Generate ticket for user and save
            Ticket sellTicket = new Ticket(ticketClass);
            ticketRepository.save(sellTicket);

        } catch (Exception e) {

            e.printStackTrace();
        }
    }    @Transactional
    public void bookTicket(BookingPayload payload, UUID userId) {

        // Kiểm tra xem show có tồn tại không thông qua gRPC
        try {
            if (!occaGrpcClient.isShowExist(payload.getShowId())) {
                throw new EntityNotFoundException("Show not found");
            }
        } catch (Exception e) {
            if (e instanceof EntityNotFoundException) {
                throw e;
            }
            log.error("Error checking if show exists: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to verify show existence", e);
        }

        // Kiểm tra người dùng có tồn tại không sử dụng gRPC
        boolean userExists = checkUserExists(userId);
        if (!userExists) {
            throw new EntityNotFoundException("User not found");
        }

        // Lặp qua danh sách hạng vé và số lượng từng hạng để kiểm tra xem mỗi vé có tồn
        // tại không và còn vé không
        if (payload.getTickets() == null || payload.getTickets().isEmpty()) {
            throw new IllegalArgumentException("Không có hạng vé nào được chọn");
        }

        // Tạo map chứa các hạng vé cần đặt và số lượng tương ứng
        Map<TicketClass, Integer> ticketClassesToBook = new HashMap<>();

        // Kiểm tra và thu thập tất cả các hạng vé cần đặt
        for (BookingPayload.TicketPayload item : payload.getTickets()) {
            // Kiểm tra số lượng vé hợp lệ
            if (item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Số lượng vé phải lớn hơn 0");
            }

            // Tìm hạng vé trong show
            TicketClass ticketClass = ticketClassRepository.findById(item.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Ticket class not found"));

            // Kiểm tra số lượng vé còn lại
            int availableTickets = calculateAvailableTickets(ticketClass);
            if (availableTickets < item.getQuantity()) {
                throw new IllegalStateException(
                        String.format("Không đủ vé hạng %s. Yêu cầu: %d, Còn lại: %d",
                                ticketClass.getName(), item.getQuantity(), availableTickets));
            }

            // Thêm vào map để xử lý tiếp
            ticketClassesToBook.put(ticketClass, item.getQuantity());
        }

        log.info("Validated all ticket classes for booking. Creating tickets for user: {}", userId);

        // Tất cả kiểm tra đã thành công, tiến hành tạo vé
        List<Ticket> createdTickets = new ArrayList<>();

        // Tạo vé cho từng loại và số lượng
        for (Map.Entry<TicketClass, Integer> entry : ticketClassesToBook.entrySet()) {
            TicketClass ticketClass = entry.getKey();
            int quantity = entry.getValue();

            for (int i = 0; i < quantity; i++) {
                Ticket ticket = new Ticket();
                ticket.setTicketClass(ticketClass);
                ticket.setEndUserId(userId);
                createdTickets.add(ticket);
            }
        }

        // Lưu tất cả vé vào database trong một lần
        ticketRepository.saveAll(createdTickets);

        log.info("Successfully booked {} tickets for user {} in show {}",
                createdTickets.size(), userId, payload.getShowId());
        
        // Sau khi đặt vé thành công, gửi thông tin thống kê qua Kafka
        try {
            // Tính toán thống kê cho người dùng
            Map<String, Object> userStats = calculateUserTicketStats(userId);
            
            // Thêm thông tin bổ sung vào message
            Map<String, Object> kafkaMessage = new HashMap<>(userStats);
            kafkaMessage.put("userId", userId.toString());
            kafkaMessage.put("bookingTime", LocalDateTime.now().toString());
            kafkaMessage.put("showId", payload.getShowId().toString());
            kafkaMessage.put("ticketsBooked", createdTickets.size());
            
            // Chuyển đổi message thành JSON
            String jsonMessage = objectMapper.writeValueAsString(kafkaMessage);
            
            // Gửi message qua Kafka
            kafkaTemplate.send(TICKET_BOOKING_TOPIC, userId.toString(), jsonMessage);
            log.info("Sent ticket booking stats to Kafka for user: {}", userId);
        } catch (Exception e) {
            // Ghi log lỗi nhưng không làm gián đoạn giao dịch đặt vé
            log.error("Failed to send ticket booking stats to Kafka: {}", e.getMessage(), e);
        }
    }

    /**
     * Kiểm tra xem người dùng có tồn tại không thông qua gRPC
     * 
     * @param userId ID người dùng cần kiểm tra
     * @return true nếu người dùng tồn tại, false nếu không
     */
    public boolean checkUserExists(UUID userId) {
        try {
            log.info("Sending gRPC request to check if user exists: {}", userId);

            var request = UserExistsRequest.newBuilder()
                    .setUserId(userId.toString())
                    .build();

            var response = userStub.checkUserExists(request);

            log.info("User exists response: {}", response.getExists());
            return response.getExists();
        } catch (Exception e) {
            log.error("Error checking if user exists via gRPC: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to check user existence", e);
        }
    }    
    private List<ListTicketsResponse> buildTicketsResponse(List<Ticket> tickets) {
        if (tickets == null || tickets.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Nhóm vé theo showId để giảm số lượng gRPC calls
        Map<UUID, List<Ticket>> ticketsByShowId = new HashMap<>();
        
        // Tạo map để lưu thông tin ticketClass cho truy cập nhanh
        Map<UUID, TicketClass> ticketClassMap = new HashMap<>();
        
        // Phân loại tickets theo showId
        for (Ticket ticket : tickets) {
            TicketClass ticketClass = ticket.getTicketClass();
            ticketClassMap.put(ticketClass.getId(), ticketClass);
            
            UUID showId = ticketClass.getShowId();
            if (!ticketsByShowId.containsKey(showId)) {
                ticketsByShowId.put(showId, new ArrayList<>());
            }
            ticketsByShowId.get(showId).add(ticket);
        }
        
        List<ListTicketsResponse> responses = new ArrayList<>();
        
        // Xử lý từng showId để giảm số lượng gRPC calls
        for (Map.Entry<UUID, List<Ticket>> entry : ticketsByShowId.entrySet()) {
            UUID showId = entry.getKey();
            List<Ticket> showTickets = entry.getValue();
            
            try {
                // Lấy thông tin show từ gRPC client
                ShowDataResponse showData = occaGrpcClient.getShowById(showId);
                
                // Lấy thông tin occa từ gRPC client
                OccaResquest occaRequest = OccaResquest.newBuilder()
                    .setOccaId(showData.getOccaId())
                    .build();
                
                OccaDataResponse occaData = occaGrpcClient.getOccaById(occaRequest);
                
                // Tạo response cho mỗi vé trong show
                for (Ticket ticket : showTickets) {
                    ListTicketsResponse response = new ListTicketsResponse();
                    
                    // Thông tin vé
                    response.setTicket(response.new Ticket(
                        ticket.getId(),
                        ticket.getCheckedInAt() != null ? ticket.getCheckedInAt().toString() : null
                    ));
                    
                    // Thông tin ticket class
                    TicketClass ticketClass = ticketClassMap.get(ticket.getTicketClass().getId());
                    response.setTicketType(response.new TicketClass(
                        ticketClass.getId(),
                        ticketClass.getName(),
                        ticketClass.getPrice()
                    ));
                    
                    // Thông tin show
                    response.setShow(response.new Show(
                        showId,
                        showData.getTime(),
                        showData.getDate()
                    ));
                    
                    // Thông tin occa
                    response.setOcca(response.new Occa(
                        UUID.fromString(showData.getOccaId()),
                        occaData.getTitle(),
                        occaData.getLocation()
                    ));
                    
                    responses.add(response);
                }
            } catch (Exception e) {
                log.error("Error fetching show/occa data for showId {}: {}", showId, e.getMessage(), e);
                // Tiếp tục với show tiếp theo nếu có lỗi
            }
        }
        
        return responses;
    }

    /**
     * Lấy vé active (chưa diễn ra) của người dùng
     */
    public List<ListTicketsResponse> getActiveTicketsData(UUID userId) {
        // Sử dụng isActive từ gRPC response
        boolean userExists = checkUserExists(userId);
        if (!userExists) {
            throw new EntityNotFoundException("User not found");
        }

        try {
            List<Ticket> tickets = ticketRepository.findByEndUserIdAndCheckedInAtIsNull(userId);

            if (tickets.isEmpty()) {
                return new ArrayList<>();
            }

            List<ListTicketsResponse> allResponses = buildTicketsResponse(tickets);

            // Lọc chỉ lấy các vé active theo kết quả từ gRPC
            return allResponses.stream()
                    .filter(response -> {
                        String ticketClassId = response.getTicketType().getId().toString();

                        // Lấy thông tin ngày giờ show
                        String dateTimeStr = response.getShow().getDate() + " " + response.getShow().getTime();
                        java.time.LocalDateTime showDateTime;
                        try {
                            showDateTime = java.time.LocalDateTime.parse(
                                    dateTimeStr,
                                    java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                        } catch (Exception e) {
                            log.warn("Unable to parse show date/time: {} for ticket: {}", dateTimeStr, ticketClassId);
                            return false;
                        }

                        // Kiểm tra xem show còn active không (chưa diễn ra)
                        return showDateTime.isAfter(java.time.LocalDateTime.now());
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving active tickets data: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve active tickets data", e);
        }
    }

    /**
     * Lấy vé đã sử dụng (đã check-in hoặc show đã diễn ra) của người dùng
     */
    public List<ListTicketsResponse> getUsedTicketsData(UUID userId) {
        boolean userExists = checkUserExists(userId);
        if (!userExists) {
            throw new EntityNotFoundException("User not found");
        }

        try {
            // Lấy tất cả vé của user
            List<Ticket> tickets = ticketRepository.findByEndUserId(userId);

            if (tickets.isEmpty()) {
                return new ArrayList<>();
            }

            List<ListTicketsResponse> allResponses = buildTicketsResponse(tickets);

            // Lọc lấy các vé đã sử dụng (đã check-in hoặc show đã diễn ra)
            return allResponses.stream()
                    .filter(response -> {
                        // Vé đã check-in được coi là đã sử dụng
                        if (response.getTicket().getCheckedInAt() != null) {
                            return true;
                        }

                        // Lấy thông tin ngày giờ show
                        String dateTimeStr = response.getShow().getDate() + " " + response.getShow().getTime();
                        java.time.LocalDateTime showDateTime;
                        try {
                            showDateTime = java.time.LocalDateTime.parse(
                                    dateTimeStr,
                                    java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                        } catch (Exception e) {
                            log.warn("Unable to parse show date/time: {} for ticket: {}",
                                    dateTimeStr, response.getTicket().getId());
                            return false;
                        }

                        // Nếu show đã diễn ra, vé cũng được coi là đã sử dụng
                        return showDateTime.isBefore(java.time.LocalDateTime.now());
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error retrieving used tickets data: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve used tickets data", e);
        }
    }

    public Double getMinPriceForShow(UUID showId) {
        List<TicketClass> ticketClasses = ticketClassRepository.findByShowId(showId);
        return ticketClasses.stream()
            .mapToDouble(TicketClass::getPrice)
            .min()
            .orElse(0);
    }

    /**
     * Add a new ticket class for a show
     * @param showId ID of the show
     * @param request Ticket class creation request
     * @return Created ticket class response
     */
    @Transactional
    public TicketClassResponse addTicketClass(UUID showId, AddTicketClassRequest request) {
        // Create new TicketClass entity
        TicketClass ticketClass = TicketClass.builder()
                .name(request.getType())
                .price(request.getPrice())
                .capacity(request.getAvailableQuantity())
                .showId(showId)
                .build();
        
        // Save to database
        TicketClass savedTicketClass = ticketClassRepository.save(ticketClass);
        log.info("Created new ticket class with ID: {} for show: {}", 
                savedTicketClass.getId(), showId);
        
        // Build and return response
        return TicketClassResponse.builder()
                .id(savedTicketClass.getId())
                .type(savedTicketClass.getName())
                .price(savedTicketClass.getPrice())
                .available(savedTicketClass.getCapacity())
                .build();
    }

    /**
     * Update an existing ticket class
     * @param ticketId ID of the ticket class to update
     * @param request Ticket class update request
     * @return Updated ticket class response
     */
    @Transactional
    public TicketClassResponse updateTicketClass(UUID ticketId, AddTicketClassRequest request) {
        // Find the ticket class by ID
        TicketClass ticketClass = ticketClassRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket class not found with ID: " + ticketId));
        
        // Update ticket class properties
        ticketClass.setName(request.getType());
        ticketClass.setPrice(request.getPrice());
        ticketClass.setCapacity(request.getAvailableQuantity());
        
        // Save to database
        TicketClass updatedTicketClass = ticketClassRepository.save(ticketClass);
        log.info("Updated ticket class with ID: {}, type: {}, price: {}, capacity: {}", 
                updatedTicketClass.getId(), 
                updatedTicketClass.getName(), 
                updatedTicketClass.getPrice(), 
                updatedTicketClass.getCapacity());
        
        // Calculate available tickets
        int availableTickets = calculateAvailableTickets(updatedTicketClass);
        
        // Build and return response
        return TicketClassResponse.builder()
                .id(updatedTicketClass.getId())
                .type(updatedTicketClass.getName())
                .price(updatedTicketClass.getPrice())
                .available(availableTickets)
                .build();
    }

    /**
     * Delete a ticket class
     * @param ticketId ID of the ticket class to delete
     */
    @Transactional
    public void deleteTicketClass(UUID ticketId) {
        // Find the ticket class by ID to ensure it exists
        TicketClass ticketClass = ticketClassRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket class not found with ID: " + ticketId));
        
        // Check if there are any sold tickets for this class
        long soldTickets = ticketRepository.countByTicketClassId(ticketId);
        if (soldTickets > 0) {
            throw new IllegalStateException("Cannot delete ticket class with sold tickets");
        }
        
        // Delete the ticket class
        ticketClassRepository.delete(ticketClass);
        log.info("Deleted ticket class with ID: {}", ticketId);
    }

    /**
     * Lock tickets for booking to prevent race conditions
     * @param request the booking lock request
     * @return booking lock response with basic information, without payment details
     */
    @Transactional
    public BookingLockResponse lockTicketsForBooking(BookingLockRequest request) {
        // Validate request
        if (request.getTickets() == null || request.getTickets().isEmpty()) {
            throw new IllegalArgumentException("No tickets specified for booking");
        }
        
        // Parse showId from String to UUID
        UUID showId;
        try {
            showId = UUID.fromString(request.getShowId());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid show ID format: " + request.getShowId());
        }
        
        // Total amount to pay
        double totalAmount = 0.0;
        
        // Map to store ticket details (will be saved to invoice)
        Map<String, Integer> ticketDetails = new HashMap<>();
        
        // Collect all ticket class IDs to lock them all at once
        List<UUID> ticketClassIds = new ArrayList<>();
        Map<UUID, Integer> requestedQuantities = new HashMap<>();
        
        // First pass: validate IDs and populate collections
        for (BookingLockRequest.TicketItem ticketItem : request.getTickets()) {
            try {
                UUID ticketClassId = UUID.fromString(ticketItem.getId());
                ticketClassIds.add(ticketClassId);
                requestedQuantities.put(ticketClassId, ticketItem.getQuantity());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid ticket class ID format: " + ticketItem.getId());
            }
        }
        
        // Use pessimistic locking to lock all ticket classes at once
        List<TicketClass> lockedTicketClasses = ticketClassRepository.findAllByIdWithPessimisticLock(ticketClassIds);
        
        // Map for easier access
        Map<UUID, TicketClass> ticketClassMap = lockedTicketClasses.stream()
                .collect(Collectors.toMap(TicketClass::getId, tc -> tc));
        
        // Check if all requested ticket classes were found
        for (UUID ticketClassId : ticketClassIds) {
            if (!ticketClassMap.containsKey(ticketClassId)) {
                throw new EntityNotFoundException("Ticket class not found: " + ticketClassId);
            }
        }
        
        // Second pass: check availability and update locked capacity
        for (UUID ticketClassId : ticketClassIds) {
            TicketClass ticketClass = ticketClassMap.get(ticketClassId);
            int requestedQuantity = requestedQuantities.get(ticketClassId);
            
            // Calculate available tickets (capacity - sold - locked)
            int availableTickets = calculateAvailableTickets(ticketClass);
            
            // Check if enough tickets are available
            if (availableTickets < requestedQuantity) {
                throw new IllegalStateException("Vé đã hết hoặc đã được đặt bởi người khác. " +
                        "Requested: " + requestedQuantity + ", Available: " + availableTickets);
            }
            
            // Lock the requested tickets by increasing the locked capacity
            ticketClass.setLockedCapacity(ticketClass.getLockedCapacity() + requestedQuantity);
            
            // Add to total amount - using ticket class price * quantity
            totalAmount += ticketClass.getPrice() * requestedQuantity;
            
            // Store ticket details for this ticket class
            ticketDetails.put(ticketClassId.toString(), requestedQuantity);
        }
        
        // Save all updated ticket classes in one transaction
        ticketClassRepository.saveAll(lockedTicketClasses);
        
        // Generate payment ID - timestamp + random string
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(0, 10);
        String randomStr = UUID.randomUUID().toString().substring(0, 12);
        String paymentId = timestamp + "_" + randomStr;
        
        // Generate payment reference code
        String referenceCode = "TK" + timestamp.substring(4);
        
        // Create Invoice entity - completely separate from PaymentInfo
        Invoice invoice = Invoice.builder()
                .soTien(totalAmount)
                .noiDung(referenceCode)
                .status(PaymentStatus.WAITING_PAYMENT)
                .paymentId(paymentId)
                .showId(showId)
                .expiresAt(LocalDateTime.now().plusMinutes(10)) // Thay đổi từ 15 phút xuống 10 phút
                .ticketDetails(ticketDetails) // Lưu chi tiết vé vào invoice
                .build();
        
        // Save invoice information
        invoiceRepository.save(invoice);
        
        // Create and return response with basic information, without payment details
        return BookingLockResponse.builder()
                .soTien(invoice.getSoTien())
                .noiDung(invoice.getNoiDung())
                .status("waiting_payment")
                .paymentId(invoice.getPaymentId())
                .build();
    }
    
    /**
     * Lấy thông tin thanh toán cho đơn đặt vé
     * @param paymentId ID của thanh toán
     * @return Thông tin thanh toán bao gồm số tài khoản, ngân hàng
     */
    public Map<String, Object> getPaymentInfo(String paymentId) {
        // Xác thực paymentId
        Invoice invoice = invoiceRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + paymentId));
        
        // Kiểm tra trạng thái của invoice
        if (invoice.getStatus() != PaymentStatus.WAITING_PAYMENT) {
            throw new IllegalStateException("Đơn hàng không ở trạng thái chờ thanh toán");
        }
        
        // Kiểm tra thời gian hết hạn
        if (invoice.getExpiresAt() != null && LocalDateTime.now().isAfter(invoice.getExpiresAt())) {
            invoice.setStatus(PaymentStatus.PAYMENT_EXPIRED);
            invoiceRepository.save(invoice);
            throw new IllegalStateException("Đơn hàng đã hết hạn thanh toán");
        }
        
        // Lấy thông tin thanh toán từ database - chỉ bao gồm thông tin tài khoản nhận tiền
        PaymentInfo paymentInfo = paymentInfoRepository.findActivePaymentInfo()
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy thông tin thanh toán trong hệ thống"));
        
        // Tạo response chỉ với thông tin thanh toán (payment info)
        Map<String, Object> response = new HashMap<>();
        response.put("soTaiKhoan", paymentInfo.getSoTaiKhoan());
        response.put("nganHang", paymentInfo.getNganHang());
        
        return response;
    }
    
    /**
     * Lấy chi tiết hóa đơn theo paymentId
     * @param paymentId ID của thanh toán
     * @return Thông tin hóa đơn bao gồm số tiền, nội dung, trạng thái
     */
    public Map<String, Object> getInvoiceDetails(String paymentId) {
        // Xác thực paymentId
        Invoice invoice = invoiceRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + paymentId));
        
        // Kiểm tra thời gian hết hạn
        if (invoice.getStatus() == PaymentStatus.WAITING_PAYMENT && 
            invoice.getExpiresAt() != null && 
            LocalDateTime.now().isAfter(invoice.getExpiresAt())) {
            invoice.setStatus(PaymentStatus.PAYMENT_EXPIRED);
            invoiceRepository.save(invoice);
        }
        
        // Tạo response với thông tin hóa đơn
        Map<String, Object> response = new HashMap<>();
        response.put("soTien", invoice.getSoTien());
        response.put("noiDung", invoice.getNoiDung());
        response.put("paymentId", invoice.getPaymentId());
        response.put("status", convertPaymentStatus(invoice.getStatus()));
        
        return response;
    }
    
    /**
     * Chuyển đổi PaymentStatus sang chuỗi cho client
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
     * Get revenue overview analytics data for a date range filtered by creator ID
     * 
     * @param from The start date of the analytics period
     * @param to The end date of the analytics period
     * @param creatorId The ID of the creator/organizer
     * @return Revenue overview analytics data for the creator
     */    
    @Transactional(readOnly = true)
    public RevenueOverviewResponse getRevenueOverview(LocalDateTime from, LocalDateTime to, String creatorId) {
        log.info("Getting revenue overview from {} to {} for creator {}", from, to, creatorId);
        
        // Get all show_id belong principal
        List<UUID> showIds = occaCreatorGrpcClient.getShowIdsByCreatorId(creatorId);
        
        // Get all successful payment invoices within the date range with showId filter
        List<Invoice> allInvoices = invoiceRepository.findByStatus(PaymentStatus.PAYMENT_SUCCESS).stream()
                .filter(invoice -> {
                    LocalDateTime createdAt = invoice.getCreatedAt();
                    return createdAt != null && 
                           !createdAt.isBefore(from) && 
                           !createdAt.isAfter(to) && 
                           showIds.contains(invoice.getShowId());
                })
                .collect(Collectors.toList());
        
        log.info("Found {} successful payments in date range", allInvoices.size());
        
        // Calculate total revenue
        double totalRevenue = allInvoices.stream()
                .mapToDouble(Invoice::getSoTien)
                .sum();
                
        // Group invoices by occa name for revenue distribution
        Map<String, Double> revenueByOcca = new HashMap<>();
        
        for (Invoice invoice : allInvoices) {
            UUID showId = invoice.getShowId();
            if (showId != null) {
                // Use OccaGrpcClient to get occa name
                String occaName = occaGrpcClient.getOccaNameByShowId(showId);
                revenueByOcca.put(occaName, revenueByOcca.getOrDefault(occaName, 0.0) + invoice.getSoTien());
            }
        }
        
        // Convert the map to list of revenue distribution items
        List<RevenueDistributionItem> distributionItems = revenueByOcca.entrySet().stream()
                .map(entry -> RevenueDistributionItem.builder()
                        .name(entry.getKey())
                        .amount(entry.getValue())
                        .build())
                .collect(Collectors.toList());
        
        // Create period object
        Period period = Period.builder()
                .from(from)
                .to(to)
                .build();
        
        // Build and return the response
        return RevenueOverviewResponse.builder()
                .totalRevenue(totalRevenue)
                .revenueDistribution(distributionItems)
                .period(period)
                .build();
    }

    /**
     * Get trendline analytics data for a date range
     * 
     * @param userId The ID of the user
     * @param from The start date of the analytics period
     * @param to The end date of the analytics period
     * @return List of daily visitors items for the trendline
     */
    @Transactional(readOnly = true)
    public List<DailyRevenueItem> getTrendlineAnalytics(UUID userId, LocalDateTime from, LocalDateTime to) {

        // Get all show_id belong principal
        List<UUID> showIds = occaCreatorGrpcClient.getShowIdsByCreatorId(userId.toString());

        // Get all successful payment invoices within the date range for the user
        List<Invoice> allInvoices = invoiceRepository.findByStatus(PaymentStatus.PAYMENT_SUCCESS).stream()
                .filter(invoice -> {
                    LocalDateTime createdAt = invoice.getCreatedAt();
                    return createdAt != null &&
                           !createdAt.isBefore(from) &&
                           !createdAt.isAfter(to) &&
                           showIds.contains(invoice.getShowId());
                })
                .collect(Collectors.toList());
        
        log.info("Found {} successful payments in date range", allInvoices.size());
        
        // Group invoices by date and calculate total revenue for each date
        Map<LocalDate, Double> revenueByDate = new HashMap<>();
        
        // Create list of all dates in the range
        LocalDate currentDate = from.toLocalDate();
        LocalDate endDate = to.toLocalDate();
        
        // Initialize all dates with zero revenue
        while (!currentDate.isAfter(endDate)) {
            revenueByDate.put(currentDate, 0.0);
            currentDate = currentDate.plusDays(1);
        }
        
        // Add actual revenue to dates that have it
        for (Invoice invoice : allInvoices) {
            LocalDateTime createdAt = invoice.getCreatedAt();
            if (createdAt != null) {
                LocalDate invoiceDate = createdAt.toLocalDate();
                revenueByDate.put(invoiceDate, revenueByDate.getOrDefault(invoiceDate, 0.0) + invoice.getSoTien());
            }
        }

        // Convert the map to list of daily revenue items
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        
        return revenueByDate.entrySet().stream()
                .sorted(Map.Entry.comparingByKey()) // Sort by date
                .map(entry -> DailyRevenueItem.builder()
                        .date(entry.getKey().format(formatter))
                        .revenue(entry.getValue().intValue())
                        .build())
                .collect(Collectors.toList());
    }
    
    /**
     * Calculate ticket statistics for a user
     * 
     * @param userId The ID of the user
     * @return Map containing statistics including totalOccas, totalSpent, and totalTickets
     */
    private Map<String, Object> calculateUserTicketStats(UUID userId) {
        log.info("Calculating ticket statistics for user: {}", userId);
        
        // Get all tickets for the user
        List<Ticket> userTickets = ticketRepository.findByEndUserId(userId);
        
        // Calculate total tickets
        int totalTickets = userTickets.size();
        
        // Calculate total spent - sum of all ticket prices
        double totalSpent = userTickets.stream()
                .mapToDouble(ticket -> ticket.getTicketClass().getPrice())
                .sum();
        
        // Calculate total unique occas the user has participated in
        Set<UUID> uniqueOccas = new HashSet<>();
        
        for (Ticket ticket : userTickets) {
            TicketClass ticketClass = ticket.getTicketClass();
            UUID showId = ticketClass.getShowId();
            
            try {
                // Get occa ID through show ID
                ShowDataResponse showData = occaGrpcClient.getShowById(showId);
                uniqueOccas.add(UUID.fromString(showData.getOccaId()));
            } catch (Exception e) {
                log.warn("Failed to get occa ID for show {}: {}", showId, e.getMessage());
                // Continue to next ticket
            }
        }
        
        // Build and return the statistics map
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOccas", uniqueOccas.size());
        stats.put("totalSpent", totalSpent);
        stats.put("totalTickets", totalTickets);
        
        log.info("User stats calculated - occas: {}, spent: {}, tickets: {}", 
                uniqueOccas.size(), totalSpent, totalTickets);
        
        return stats;
    }
}