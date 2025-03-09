package com.ticket.servermono.ticketcontext.usecases;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.ticketcontext.adapters.dtos.BookingPayload;
import com.ticket.servermono.ticketcontext.adapters.dtos.ListTicketsResponse;
import com.ticket.servermono.ticketcontext.entities.Ticket;
import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import occa.OccaDataResponse;
import occa.OccaResquest;
import occa.ShowDataResponse;
import occa.ShowRequest;
import occa.ShowResponse;
import occa.ShowServicesGrpc.ShowServicesBlockingStub;
import occa.OccaServicesGrpc.OccaServicesBlockingStub;
import user.UserExistsRequest;
import user.UserServiceGrpc;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketServices {
    private final TicketClassRepository ticketClassRepository;
    private final TicketRepository ticketRepository;

    private final KafkaTemplate<String, String> kafkaTemplate;

    @GrpcClient("user-service")
    private UserServiceGrpc.UserServiceBlockingStub userStub;

    @GrpcClient("occa-service")
    private ShowServicesBlockingStub showStub;

    @GrpcClient("occa-service")
    private OccaServicesBlockingStub occaStub;

    public int calculateAvailableTickets(TicketClass ticketClass) {
        Long soldTickets = ticketRepository.countByTicketClassId(ticketClass.getId());
        return ticketClass.getCapacity() - soldTickets.intValue();
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
    }

    @Transactional
    public void bookTicket(BookingPayload payload, UUID userId) {

        // Kiểm tra xem show có tồn tại không thông qua
        ShowRequest showRequest = ShowRequest.newBuilder()
                .setShowId(payload.getShowId().toString())
                .build();
        ShowResponse showResponse = showStub.isShowExist(showRequest);
        if (!showResponse.getIsShowExist()) {
            throw new EntityNotFoundException("Show not found");
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
                // Lấy thông tin show từ gRPC
                ShowRequest showRequest = ShowRequest.newBuilder()
                    .setShowId(showId.toString())
                    .build();
                
                ShowDataResponse showData = showStub.getShowById(showRequest);
                
                // Lấy thông tin occa từ gRPC
                OccaResquest occaRequest = OccaResquest.newBuilder()
                    .setOccaId(showData.getOccaId())
                    .build();
                
                OccaDataResponse occaData = occaStub.getOccaById(occaRequest);
                
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

    public void publishNextShowDateTime(UUID showId) {
        if (showId == null) {
            log.warn("Attempted to publish null showId to Kafka");
            return;
        }
        
        log.info("Publishing show ID {} to update-next-show-datetime topic", showId);
        kafkaTemplate.send("update-next-show-datetime", showId.toString());
    }
}