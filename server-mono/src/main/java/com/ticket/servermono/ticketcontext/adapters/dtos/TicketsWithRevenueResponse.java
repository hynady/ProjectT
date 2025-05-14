package com.ticket.servermono.ticketcontext.adapters.dtos;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.domain.Page;

/**
 * Response DTO containing tickets with revenue information for each ticket class
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketsWithRevenueResponse {
    private Page<TicketWithRecipientInfoResponse> tickets;
    private List<TicketClassRevenue> revenueByTicketClass;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketClassRevenue {
        private UUID ticketClassId;
        private String ticketClassName;
        private int ticketsSold;
        private double totalRevenue;
    }
}
