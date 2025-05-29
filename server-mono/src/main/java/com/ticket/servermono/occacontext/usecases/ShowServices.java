package com.ticket.servermono.occacontext.usecases;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.occacontext.adapters.dtos.Show.AddShowPayload;
import com.ticket.servermono.occacontext.adapters.dtos.Show.OccaShowDataResponse;
import com.ticket.servermono.occacontext.adapters.dtos.Show.OccaShowDataResponse.PriceInfo;
import com.ticket.servermono.occacontext.adapters.dtos.Show.OrganizeShowResponse;
import com.ticket.servermono.occacontext.adapters.dtos.Show.OrganizeShowResponse.TicketInfo;
import com.ticket.servermono.occacontext.adapters.dtos.Show.ShowResponse;
import com.ticket.servermono.occacontext.domain.enums.SaleStatus;
import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.entities.Show;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.ShowRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import ticket.TicketShowServicesGrpc.TicketShowServicesBlockingStub;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShowServices {
    private final ShowRepository showRepository;

    private final KafkaTemplate<String, String> kafkaTemplate;

    private final String CLASS_INIT = "ticket_class_init";

    private final OccaRepository occaRepository;

    @GrpcClient("ticket-service")
    private TicketShowServicesBlockingStub ticketShowStub;

    public List<OrganizeShowResponse> getOrganizeShowsByOccaId(UUID occaId) {
        List<Show> shows = showRepository.findByOccaId(occaId);
        if (shows.isEmpty()) {
            throw new EntityNotFoundException("No shows found for occasion: " + occaId);
        }

        return shows.stream()
                .map(show -> {
                    OrganizeShowResponse response = new OrganizeShowResponse();
                    response.setId(show.getId());
                    response.setDate(show.getDate().toString());
                    response.setTime(show.getTime().toString());

                    // Determine sale status based on show's properties
                    response.setSaleStatus(show.getSaleStatus() != null
                            ? formatSaleStatus(show.getSaleStatus())
                            : formatSaleStatus(determineSaleStatus(show)));
                    response.setAutoUpdateStatus(show.getAutoUpdateStatus());

                    // Get ticket prices and availability for this show
                    List<TicketInfo> tickets = getTicketInfoForShow(show.getId());
                    response.setTickets(tickets);

                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Xác định trạng thái bán hàng của một show dựa trên nhiều yếu tố:
     * 1. Nếu autoUpdateStatus = false, giữ nguyên trạng thái hiện tại
     * 2. Nếu show đã lưu trạng thái và không phải là UPCOMING thì giữ nguyên
     * 3. Nếu ngày của show đã qua thì ENDED
     * 4. Nếu không có vé nào thì UPCOMING
     * 5. Nếu không có vé nào có sẵn (số lượng = 0) thì SOLD_OUT
     * 6. Nếu có vé có sẵn thì ON_SALE
     */
    private SaleStatus determineSaleStatus(Show show) {
        // Kiểm tra cài đặt tự động cập nhật
        if (show.getAutoUpdateStatus() != null && !show.getAutoUpdateStatus()) {
            // Nếu tắt tự động cập nhật, giữ nguyên trạng thái
            return show.getSaleStatus() != null ? show.getSaleStatus() : SaleStatus.UPCOMING;
        }

        // Nếu show đã có trạng thái khác UPCOMING, giữ nguyên
        if (show.getSaleStatus() != null && show.getSaleStatus() != SaleStatus.UPCOMING) {
            return show.getSaleStatus();
        }

        // Kiểm tra ngày - nếu show đã qua thì ENDED
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        if (show.getDate().isBefore(today) ||
                (show.getDate().isEqual(today) && show.getTime().isBefore(now))) {
            return SaleStatus.ENDED;
        }

        // Kiểm tra tình trạng vé
        List<PriceInfo> priceInfos = getTicketClassesForShow(show.getId());

        // Không có loại vé nào
        if (priceInfos.isEmpty()) {
            return SaleStatus.UPCOMING;
        }

        // Kiểm tra số lượng vé còn lại
        boolean hasAvailableTickets = priceInfos.stream()
                .anyMatch(priceInfo -> priceInfo.getAvailable() != null && priceInfo.getAvailable() > 0);

        if (hasAvailableTickets) {
            return SaleStatus.ON_SALE;
        } else {
            return SaleStatus.SOLD_OUT;
        }
    }

    /**
     * Chuyển đổi enum SaleStatus thành chuỗi phù hợp với client
     */
    private String formatSaleStatus(SaleStatus status) {
        if (status == null) {
            return "upcoming"; // Giá trị mặc định
        }

        return status.name().toLowerCase();
    }

    private List<TicketInfo> getTicketInfoForShow(UUID showId) {
        try {
            List<PriceInfo> priceInfos = getTicketClassesForShow(showId);

            return priceInfos.stream()
                    .map(priceInfo -> {
                        TicketInfo ticketInfo = new TicketInfo();
                        ticketInfo.setId(priceInfo.getId());
                        ticketInfo.setType(priceInfo.getType());
                        ticketInfo.setPrice(priceInfo.getPrice());
                        ticketInfo.setAvailable(priceInfo.getAvailable());
                        return ticketInfo;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to get ticket information for show: " + showId, e);
            // For organizing view, we return empty list instead of throwing an exception
            return List.of();
        }
    }

    public List<OccaShowDataResponse> getShowsByOccaId(UUID occaId) {
        List<Show> shows = showRepository.findByOccaIdAndSaleStatusIn(
                occaId,
                List.of(SaleStatus.ON_SALE, SaleStatus.SOLD_OUT, SaleStatus.UPCOMING));

        if (shows.isEmpty()) {
            throw new EntityNotFoundException("No shows found for occasion: " + occaId);
        }

        return shows.stream()
                .map(show -> {
                    OccaShowDataResponse response = new OccaShowDataResponse();
                    // Direct mapping since Show entity stores date and time as strings
                    response.setId(show.getId());
                    response.setDate(show.getDate());
                    response.setTime(show.getTime());
                    response.setSaleStatus(formatSaleStatus(show.getSaleStatus()));

                    // Get ticket prices and availability for this show
                    List<PriceInfo> prices = getTicketClassesForShow(show.getId());
                    response.setPrices(prices);

                    return response;
                })
                .collect(Collectors.toList());
    }

    private List<PriceInfo> getTicketClassesForShow(UUID showId) {
        try {
            showRepository.findById(showId)
                    .orElseThrow(() -> new EntityNotFoundException("Show not found"));

            ticket.TicketShowResponse response = ticketShowStub.getTicketClassesByShowId(
                    ticket.TicketShowRequest.newBuilder()
                            .setShowId(showId.toString())
                            .build());

            // Không ném ngoại lệ nếu không có ticket class, chỉ trả về danh sách rỗng
            if (response.getTicketClassesList().isEmpty()) {
                log.info("No ticket classes found for show ID: {}, returning empty list", showId);
                return List.of();
            }

            return response.getTicketClassesList().stream()
                    .map(ticketClass -> {
                        PriceInfo priceInfo = new PriceInfo();
                        priceInfo.setId(UUID.fromString(ticketClass.getId()));
                        priceInfo.setType(ticketClass.getName());
                        priceInfo.setPrice(ticketClass.getPrice());
                        priceInfo.setAvailable(ticketClass.getAvailable());
                        return priceInfo;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to get ticket classes for show: " + showId, e);
            // Trả về danh sách rỗng thay vì ném ngoại lệ
            return List.of();
        }
    }

    /**
     * Lấy giá thấp nhất cho một show cụ thể thông qua gRPC
     * 
     * @param showId ID của show cần lấy giá
     * @return Giá thấp nhất hoặc null nếu không có giá
     */
    @Transactional(readOnly = true)
    public Double getMinPriceForShow(UUID showId) {
        // Giả sử bạn có một phương thức để lấy tất cả các loại vé của một show
        List<PriceInfo> priceInfos = getTicketClassesForShow(showId);

        // Nếu danh sách trống, trả về 0
        if (priceInfos.isEmpty()) {
            return 0.0;
        }

        // Tìm giá thấp nhất trong các loại vé
        return priceInfos.stream()
                .map(PriceInfo::getPrice)
                .filter(price -> price != null && price > 0) // Lọc ra các giá hợp lệ
                .min(Double::compare)
                .orElse(0.0);
    }

    public void initializeTicketClasses(UUID showId) {

        kafkaTemplate.send(CLASS_INIT, showId.toString());
    }

    /**
     * Chuyển đổi string thành SaleStatus enum
     * Tương tự như phương thức parseApprovalStatus trong OrganizerServices
     */
    private SaleStatus parseSaleStatus(String status) {
        if (status == null || status.isEmpty()) {
            return SaleStatus.UPCOMING;
        }

        try {
            return SaleStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid sale status: {}, falling back to UPCOMING", status);
            return SaleStatus.UPCOMING;
        }
    }

    /**
     * Add a new show to an occasion
     * 
     * @param occaId   ID of the occasion
     * @param showData Show data payload
     * @return Created show response
     */
    @Transactional
    public ShowResponse addShow(UUID occaId, AddShowPayload showData, UUID userId) {
        // Find the occasion
        Occa occa = occaRepository.findById(occaId)
                .orElseThrow(() -> new EntityNotFoundException("Occasion not found with ID: " + occaId));

        // Parse date and time
        LocalDate date = LocalDate.parse(showData.getDate(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        LocalTime time = LocalTime.parse(showData.getTime(), DateTimeFormatter.ofPattern("HH:mm"));        // Create new show with parsed sale status
        Show show = Show.builder()
                .occa(occa)
                .date(date)
                .time(time)
                .saleStatus(parseSaleStatus(showData.getSaleStatus()))
                .autoUpdateStatus(showData.getAutoUpdateStatus() != null ? showData.getAutoUpdateStatus() : true)
                .build();

        // Manually set userId for audit trail
        show.setCreatedBy(userId);
        show.setUpdatedBy(userId);

        // Save the show
        Show savedShow = showRepository.save(show);

        // Prepare response
        ShowResponse response = new ShowResponse();
        response.setId(savedShow.getId());
        response.setDate(savedShow.getDate().toString());
        response.setTime(savedShow.getTime().toString());
        response.setSaleStatus(formatSaleStatus(savedShow.getSaleStatus()));
        response.setAutoUpdateStatus(savedShow.getAutoUpdateStatus());
        response.setTickets(List.of()); // Empty tickets list for new show

        return response;
    }

    /**
     * Update an existing show
     * 
     * @param occaId   ID of the occasion
     * @param showId   ID of the show to update
     * @param showData Updated show data
     * @return Updated show response
     */
    @Transactional
    public ShowResponse updateShow(UUID occaId, UUID showId, AddShowPayload showData, UUID userId) {
        // Find the show and verify it belongs to the specified occasion
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new EntityNotFoundException("Show not found with ID: " + showId));

        // Verify the show belongs to the correct occasion
        if (!show.getOcca().getId().equals(occaId)) {
            throw new EntityNotFoundException("Show does not belong to the specified occasion");
        }

        // Parse date and time
        LocalDate date = LocalDate.parse(showData.getDate(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        LocalTime time = LocalTime.parse(showData.getTime(), DateTimeFormatter.ofPattern("HH:mm"));

        // Update show fields
        show.setDate(date);
        show.setTime(time);
        show.setSaleStatus(parseSaleStatus(showData.getSaleStatus()));        // Update autoUpdateStatus if provided
        if (showData.getAutoUpdateStatus() != null) {
            show.setAutoUpdateStatus(showData.getAutoUpdateStatus());
        }

        // Manually set userId for audit trail on updates
        show.setUpdatedBy(userId);

        // Save the updated show
        Show updatedShow = showRepository.save(show);
        // Prepare response
        ShowResponse response = new ShowResponse();
        response.setId(updatedShow.getId());
        // Format date explicitly to ensure consistent format
        response.setDate(updatedShow.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        response.setTime(updatedShow.getTime().format(DateTimeFormatter.ofPattern("HH:mm")));
        response.setSaleStatus(formatSaleStatus(updatedShow.getSaleStatus()));
        response.setAutoUpdateStatus(updatedShow.getAutoUpdateStatus());

        // Get ticket information for the show - Convert to ShowResponse.TicketInfo
        List<OrganizeShowResponse.TicketInfo> organizeTickets = getTicketInfoForShow(showId);
        List<ShowResponse.TicketInfo> responseTickets = organizeTickets.stream()
                .map(orgTicket -> {
                    ShowResponse.TicketInfo ticketInfo = new ShowResponse.TicketInfo();
                    ticketInfo.setId(orgTicket.getId());
                    ticketInfo.setType(orgTicket.getType());
                    ticketInfo.setPrice(orgTicket.getPrice());
                    ticketInfo.setAvailable(orgTicket.getAvailable());
                    // Setting sold to 0 as a default if not available
                    ticketInfo.setSold(0);
                    return ticketInfo;
                })
                .collect(Collectors.toList());

        response.setTickets(responseTickets);

        return response;
    }

    /**
     * Delete a show
     * 
     * @param occaId ID of the occasion
     * @param showId ID of the show to delete
     */
    @Transactional
    public void deleteShow(UUID occaId, UUID showId) {
        // Find the show and verify it belongs to the specified occasion
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new EntityNotFoundException("Show not found with ID: " + showId));

        // Verify the show belongs to the correct occasion
        if (!show.getOcca().getId().equals(occaId)) {
            throw new EntityNotFoundException("Show does not belong to the specified occasion");
        }

        // Delete the show
        showRepository.delete(show);
    }
}
