package com.ticket.servermono.occacontext.infrastructure.grpc;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.entities.Show;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.ShowRepository;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import occa.ShowDataResponse;
import occa.ShowRequest;
import occa.ShowResponse;
import occa.ShowServicesGrpc.ShowServicesImplBase;
import occa.TicketStatusData;
import occa.TicketStatusRequest;
import occa.TicketStatusResponse;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class ShowServicesGrpc extends ShowServicesImplBase {

    private final ShowRepository showRepository;
    private final OccaRepository occaRepository;

    @Override
    public void getTicketsClassStatus(TicketStatusRequest request,
            StreamObserver<TicketStatusResponse> responseObserver) {
        try {
            List<String> showIds = request.getShowIdsList();
            List<String> ticketClassIds = request.getTicketClassIdsList();

            if (showIds.size() != ticketClassIds.size()) {
                responseObserver.onError(
                        Status.INVALID_ARGUMENT
                                .withDescription("Show IDs and ticket class IDs must have the same length")
                                .asRuntimeException());
                return;
            }

            Map<String, String> ticketClassToShowMap = new HashMap<>();
            for (int i = 0; i < showIds.size(); i++) {
                ticketClassToShowMap.put(ticketClassIds.get(i), showIds.get(i));
            }

            List<TicketStatusData> statusList = new ArrayList<>();

            // Lấy dữ liệu show theo showId
            for (String showId : new HashSet<>(showIds)) { // Sử dụng HashSet để loại bỏ các showId trùng lặp
                Optional<Show> showOpt = showRepository.findById(UUID.fromString(showId));

                if (showOpt.isPresent()) {
                    Show show = showOpt.get();

                    // Lấy thông tin occa
                    Optional<Occa> occaOpt = occaRepository.findById(show.getOcca().getId());

                    LocalDateTime showDateTime = LocalDateTime.parse(
                            show.getDate() + " " + show.getTime(),
                            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

                    // Kiểm tra show đã diễn ra chưa
                    boolean isActive = showDateTime.isAfter(LocalDateTime.now());

                    // Tìm các ticketClassId liên kết với showId này
                    for (Map.Entry<String, String> entry : ticketClassToShowMap.entrySet()) {
                        if (entry.getValue().equals(showId)) {
                            TicketStatusData.Builder ticketStatus = TicketStatusData.newBuilder()
                                    .setTicketClassId(entry.getKey())
                                    .setShowId(showId)
                                    .setIsActive(isActive)
                                    .setShowDate(show.getDate())
                                    .setShowTime(show.getTime());

                            if (occaOpt.isPresent()) {
                                Occa occa = occaOpt.get();
                                ticketStatus.setOccaId(occa.getId().toString())
                                        .setOccaTitle(occa.getTitle())
                                        .setOccaLocation(occa.getVenue().getLocation());
                            }

                            statusList.add(ticketStatus.build());
                        }
                    }
                }
            }

            TicketStatusResponse response = TicketStatusResponse.newBuilder()
                    .addAllTickets(statusList)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error getting ticket class status: {}", e.getMessage());
            responseObserver.onError(
                    Status.INTERNAL.withDescription("Error getting ticket class status").asRuntimeException());
        }
    }

    @Override
    public void isShowExist(ShowRequest request, StreamObserver<ShowResponse> responseObserver) {
        try {
            String showId = request.getShowId();

            if (showId == null || showId.isEmpty()) {
                responseObserver.onError(
                        Status.INVALID_ARGUMENT
                                .withDescription("Show ID cannot be null or empty")
                                .asRuntimeException());
                return;
            }

            boolean exists = showRepository.findById(UUID.fromString(showId)).isPresent();

            ShowResponse response = ShowResponse.newBuilder()
                    .setIsShowExist(exists)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for show ID: {}", e.getMessage());
            responseObserver.onError(
                    Status.INVALID_ARGUMENT
                            .withDescription("Invalid UUID format for show ID")
                            .asRuntimeException());
        } catch (Exception e) {
            log.error("Error checking if show exists: {}", e.getMessage());
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Error checking if show exists")
                            .asRuntimeException());
        }
    }

    @Override
    @Transactional
    public void getShowById(ShowRequest request, StreamObserver<ShowDataResponse> responseObserver) {
        try {
            String showId = request.getShowId();

            if (showId == null || showId.isEmpty()) {
                responseObserver.onError(
                        Status.INVALID_ARGUMENT
                                .withDescription("Show ID cannot be null or empty")
                                .asRuntimeException());
                return;
            }

            Optional<Show> showOpt = showRepository.findById(UUID.fromString(showId));

            if (showOpt.isEmpty()) {
                responseObserver.onError(
                        Status.NOT_FOUND
                                .withDescription("Show not found with ID: " + showId)
                                .asRuntimeException());
                return;
            }

            Show show = showOpt.get();

            ShowDataResponse response = ShowDataResponse.newBuilder()
                    .setTime(show.getTime())
                    .setDate(show.getDate())
                    .setOccaId(show.getOcca().getId().toString())
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for show ID: {}", e.getMessage());
            responseObserver.onError(
                    Status.INVALID_ARGUMENT
                            .withDescription("Invalid UUID format for show ID")
                            .asRuntimeException());
        } catch (Exception e) {
            log.error("Error getting show by ID: {}", e.getMessage());
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription("Error getting show by ID")
                            .asRuntimeException());
        }
    }
}
