package com.ticket.servermono.ticketcontext.adapters.dtos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for paginated tickets with recipient information and revenue data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedTicketsWithRevenueResponse {
    private List<TicketWithRecipientInfoResponse> tickets;
    private List<TicketsWithRevenueResponse.TicketClassRevenue> revenueByTicketClass;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    
    /**
     * Create a PaginatedTicketsWithRevenueResponse from a TicketsWithRevenueResponse and ticket page info
     */
    public static PaginatedTicketsWithRevenueResponse fromTicketsWithRevenue(TicketsWithRevenueResponse response) {
        return PaginatedTicketsWithRevenueResponse.builder()
                .tickets(response.getTickets().getContent())
                .revenueByTicketClass(response.getRevenueByTicketClass())
                .page(response.getTickets().getNumber())
                .size(response.getTickets().getSize())
                .totalElements(response.getTickets().getTotalElements())
                .totalPages(response.getTickets().getTotalPages())
                .build();
    }
}
