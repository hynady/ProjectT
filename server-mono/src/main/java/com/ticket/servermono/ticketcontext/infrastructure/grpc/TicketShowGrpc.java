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
            if (ticketClasses.isEmpty()) {
                log.error("No ticket classes found for show ID: {}", request.getShowId());
                responseObserver.onError(new Exception("No ticket classes found for show ID: " + request.getShowId()));
                return;
            }
            
            TicketShowResponse.Builder responseBuilder = TicketShowResponse.newBuilder();
            
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
            
            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();
            log.info("Successfully sent ticket classes for show ID: {}", request.getShowId());
        } catch (IllegalArgumentException e) {
            log.error("Invalid show ID: {}", request.getShowId());
            responseObserver.onError(new Exception("Invalid show ID: " + request.getShowId()));
        } catch (Exception e) {
            log.error("Error processing gRPC request for ticket classes: {}", e.getMessage(), e);
            responseObserver.onError(e);
        }
    }
}