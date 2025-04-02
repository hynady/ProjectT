package com.ticket.servermono.ticketcontext.infrastructure.grpc;

import java.util.List;
import java.util.UUID;

import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;
import com.ticket.servermono.ticketcontext.usecases.TicketServices;

import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import ticket.GetMinPriceForShowRequest;
import ticket.GetMinPriceForShowResponse;
import ticket.TicketClassResponse;
import ticket.TicketShowRequest;
import ticket.TicketShowResponse;
import ticket.TicketShowServicesGrpc.TicketShowServicesImplBase;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class TicketShowGrpc extends TicketShowServicesImplBase {

    private final TicketClassRepository ticketClassRepository;
    private final TicketServices ticketServices;

    @Override
    public void getTicketClassesByShowId(TicketShowRequest request, StreamObserver<TicketShowResponse> responseObserver) {
        log.info("Received gRPC request for ticket classes with show ID: {}", request.getShowId());
        try {
            List<TicketClass> ticketClasses = ticketClassRepository.findByShowId(UUID.fromString(request.getShowId()));
            
            // Không ném ngoại lệ nếu không tìm thấy ticket classes
            // Thay vào đó, trả về danh sách rỗng
            TicketShowResponse.Builder responseBuilder = TicketShowResponse.newBuilder();
            
            if (ticketClasses.isEmpty()) {
                log.info("No ticket classes found for show ID: {}, returning empty response", request.getShowId());
            } else {
                ticketClasses.forEach(ticketClass -> {
                    // Sử dụng phương thức từ TicketServices để tính số lượng vé còn lại
                    int available = ticketServices.calculateAvailableTickets(ticketClass);
                    
                    responseBuilder.addTicketClasses(TicketClassResponse.newBuilder()
                        .setId(ticketClass.getId().toString())
                        .setName(ticketClass.getName())
                        .setPrice(ticketClass.getPrice())
                        .setAvailable(available)
                        .build());
                });
            }
            
            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();
            log.info("Successfully sent ticket classes response for show ID: {}", request.getShowId());
        } catch (IllegalArgumentException e) {
            log.error("Invalid show ID: {}", request.getShowId());
            responseObserver.onError(new Exception("Invalid show ID: " + request.getShowId()));
        } catch (Exception e) {
            log.error("Error processing gRPC request for ticket classes: {}", e.getMessage(), e);
            responseObserver.onError(e);
        }
    }

    /**
     * Lấy giá thấp nhất của một show
     */
    @Override
    public void getMinPriceForShow(GetMinPriceForShowRequest request, 
                                  StreamObserver<GetMinPriceForShowResponse> responseObserver) {
        log.info("Received gRPC request for min price with show ID: {}", request.getShowId());
        try {
            UUID showId = UUID.fromString(request.getShowId());
            
            // Sử dụng phương thức đã có trong TicketServices
            Double minPrice = ticketServices.getMinPriceForShow(showId);
            
            GetMinPriceForShowResponse.Builder responseBuilder = GetMinPriceForShowResponse.newBuilder();
            
            if (minPrice != null && minPrice > 0) {
                responseBuilder.setPrice(minPrice);
                responseBuilder.setHasPrice(true);
                log.info("Found min price {} for show ID: {}", minPrice, request.getShowId());
            } else {
                responseBuilder.setPrice(0);
                responseBuilder.setHasPrice(false);
                log.warn("No valid price found for show ID: {}", request.getShowId());
            }
            
            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();
        } catch (IllegalArgumentException e) {
            log.error("Invalid show ID: {}", request.getShowId());
            responseObserver.onError(new Exception("Invalid show ID: " + request.getShowId()));
        } catch (Exception e) {
            log.error("Error processing gRPC request for min price: {}", e.getMessage(), e);
            responseObserver.onError(e);
        }
    }
}