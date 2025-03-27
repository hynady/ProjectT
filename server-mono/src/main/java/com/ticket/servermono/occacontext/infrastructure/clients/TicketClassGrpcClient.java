package com.ticket.servermono.occacontext.infrastructure.clients;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.ticket.servermono.occacontext.adapters.dtos.organizer.TicketDTO;

import io.grpc.StatusRuntimeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import ticket.TicketClassResponse;
import ticket.TicketShowServicesGrpc;
import ticket.TicketShowRequest;
import ticket.TicketShowResponse;

@Slf4j
@Component
@RequiredArgsConstructor
public class TicketClassGrpcClient {

    @GrpcClient("ticket-service")
    private TicketShowServicesGrpc.TicketShowServicesBlockingStub ticketServiceStub;
    
    /**
     * Lấy danh sách ticket class cho một show cụ thể
     * 
     * @param showId ID của show
     * @return Danh sách ticket class
     */
    public List<TicketDTO> getTicketClassesByShowId(String showId) {
        List<TicketDTO> results = new ArrayList<>();
        
        try {
            // Tạo request
            TicketShowRequest request = TicketShowRequest.newBuilder()
                    .setShowId(showId)
                    .build();
            
            // Gọi gRPC service
            TicketShowResponse response = ticketServiceStub.getTicketClassesByShowId(request);
            
            // Chuyển đổi kết quả sang DTO
            for (TicketClassResponse ticketClass : response.getTicketClassesList()) {
                TicketDTO dto = TicketDTO.builder()
                        .id(ticketClass.getId())
                        .showId(showId)
                        .type(ticketClass.getName())
                        .price(ticketClass.getPrice())
                        .availableQuantity(ticketClass.getAvailable())
                        .build();
                
                results.add(dto);
            }
        } catch (StatusRuntimeException e) {
            log.error("Error calling ticket service via gRPC: {}", e.getMessage());
        }
        
        return results;
    }
}
