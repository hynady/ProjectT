package com.ticket.servermono.ticketcontext.usecases;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.ticketcontext.adapters.dtos.BookingPayload;
import com.ticket.servermono.ticketcontext.adapters.dtos.ListTicketsResponse;
import com.ticket.servermono.ticketcontext.entities.Show;
import com.ticket.servermono.ticketcontext.entities.Ticket;
import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.ShowRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import occa.OccaMyTicketsResponse;
import occa.OccaMyTicketsServiceGrpc;
import occa.Payload;
import user.UserExistsRequest;
import user.UserServiceGrpc;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketServices {
    private final TicketClassRepository ticketClassRepository;
    private final TicketRepository ticketRepository;
    private final ShowServices showServices;
    private final ShowRepository showRepository;

    @GrpcClient("user-service")
    private UserServiceGrpc.UserServiceBlockingStub userStub;

    @GrpcClient("occa-service")
    private OccaMyTicketsServiceGrpc.OccaMyTicketsServiceBlockingStub occaStub;

    @Transactional
    public void sellTicket(UUID ticketClassId) {
        try {
            // check if ticket class exists
            TicketClass ticketClass = ticketClassRepository.findById(ticketClassId)
                    .orElseThrow(() -> new IllegalStateException("Ticket class not found"));
            // check if ticket is available
            if (showServices.isSoldOut(ticketClass)) {
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
        // Kiểm tra xem show có tồn tại không
        Show show = showRepository.findById(payload.getShowId())
                .orElseThrow(() -> new EntityNotFoundException("Show not found"));

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
            TicketClass ticketClass = show.getTicketClasses().stream()
                    .filter(tc -> tc.getId().equals(item.getId()))
                    .findFirst()
                    .orElseThrow(() -> new EntityNotFoundException("Hạng vé không tồn tại: " + item.getId()));

            // Kiểm tra số lượng vé còn lại
            int availableTickets = showServices.calculateAvailableTickets(ticketClass);
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
                createdTickets.size(), userId, show.getId());
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

    /**
     * Phương thức build response từ ticket entity
     * 
     * @param ticket Ticket entity
     * @return ListTicketsResponse được build từ ticket
     */
    private ListTicketsResponse buildTicketResponse(Ticket ticket) {
        ListTicketsResponse response = new ListTicketsResponse();
        
        // Populate ticket info
        response.setTicket(response.new Ticket(
            ticket.getId(),
            ticket.getCheckedInAt() != null ? ticket.getCheckedInAt().toString() : null
        ));

        // Populate ticket class info
        TicketClass ticketClass = ticket.getTicketClass();
        response.setTicketType(response.new TicketClass(
            ticketClass.getId(),
            ticketClass.getName(),
            ticketClass.getPrice()
        ));

        // Populate show info
        Show show = ticketClass.getShow();
        response.setShow(response.new Show(
            show.getId(),
            show.getTime().toString(),
            show.getDate().toString()
        ));

        // Populate occasion info từ gRPC
        populateOccaInfo(show, response);
        
        return response;
    }
    
    /**
     * Hàm lấy thông tin Occa từ gRPC service
     * 
     * @param show Show object chứa occaId
     * @param listTicketsResponse Response object để populate thông tin Occa
     */
    private void populateOccaInfo(Show show, ListTicketsResponse response) {
        try {
            UUID occaId = show.getOccaId();
            
            Payload request = Payload.newBuilder()
                .setOccaId(occaId.toString())
                .build();
            
            OccaMyTicketsResponse occaResponse = occaStub.getOccaInfoForMyTicket(request);
            
            // Populate occasion info từ gRPC response
            response.setOcca(response.new Occa(
                occaId,
                occaResponse.getTitle(),
                occaResponse.getLocation()
            ));
            
            log.debug("Successfully retrieved occa info for ID: {}", occaId);
        } catch (Exception e) {
            log.error("Error fetching occa details via gRPC: {}", e.getMessage(), e);
            // Fallback nếu gRPC call thất bại - sử dụng thông tin show
            response.setOcca(response.new Occa(
                show.getOccaId(),
                "Không thể tải thông tin sự kiện",
                "N/A"
            ));
        }
    }

    public List<ListTicketsResponse> getActiveTicketsData(UUID userId) {
        // Kiểm tra user có tồn tại không
        boolean userExists = checkUserExists(userId);
        if (!userExists) {
            throw new EntityNotFoundException("User not found");
        }
        try {
            List<Ticket> tickets = ticketRepository.findActiveTicketsByUserId(userId);
            List<ListTicketsResponse> responses = new ArrayList<>();
            
            // Build response cho mỗi ticket
            for (Ticket ticket : tickets) {
                ListTicketsResponse response = buildTicketResponse(ticket);
                responses.add(response);
            }
            
            return responses;
        } catch (Exception e) {
            log.error("Error retrieving active tickets data: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve active tickets data", e);
        }
    }

    public List<ListTicketsResponse> getUsedTicketsData(UUID userId) {
        // Kiểm tra user có tồn tại không
        boolean userExists = checkUserExists(userId);
        if (!userExists) {
            throw new EntityNotFoundException("User not found");
        }
        try {
            List<Ticket> tickets = ticketRepository.findUsedTicketsByUserId(userId);

            log.info("Found {} used tickets for user {}", tickets.size(), userId);

            List<ListTicketsResponse> responses = new ArrayList<>();
            
            // Build response cho mỗi ticket
            for (Ticket ticket : tickets) {
                ListTicketsResponse response = buildTicketResponse(ticket);
                responses.add(response);
            }
            
            return responses;
        } catch (Exception e) {
            log.error("Error retrieving used tickets data: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve used tickets data", e);
        }
    }
}
