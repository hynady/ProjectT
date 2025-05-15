package com.ticket.servermono.ticketcontext.grpc;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import occa.ShowDataResponse;
import occa.ShowRequest;
import occa.ShowServicesGrpc.ShowServicesBlockingStub;
import ticket.TicketShowRequest;
import ticket.TicketShowResponse;
import ticket.TicketShowServicesGrpc.TicketShowServicesBlockingStub;

@Service
@Slf4j
@RequiredArgsConstructor
public class ShowGrpcClient {
    
    @GrpcClient("show-service")
    private ShowServicesBlockingStub showServiceStub;
    
    @GrpcClient("ticket-service")
    private TicketShowServicesBlockingStub ticketShowServiceStub;

    public ShowDataResponse getShowById(ShowRequest request) {
        try {
            return showServiceStub.getShowById(request);
        } catch (Exception e) {
            log.error("Error calling Show gRPC service: {}", e.getMessage());
            throw e;
        }
    }

    public TicketShowResponse getTicketClassesByShowId(TicketShowRequest request) {
        try {
            return ticketShowServiceStub.getTicketClassesByShowId(request);
        } catch (Exception e) {
            log.error("Error calling Ticket Show gRPC service: {}", e.getMessage());
            throw e;
        }
    }
}
