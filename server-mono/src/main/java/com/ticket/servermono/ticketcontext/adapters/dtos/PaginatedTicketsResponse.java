package com.ticket.servermono.ticketcontext.adapters.dtos;

import java.util.List;

import org.springframework.data.domain.Page;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for paginated tickets with recipient information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedTicketsResponse {
    private List<TicketWithRecipientInfoResponse> tickets;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    
    /**
     * Create a PaginatedTicketsResponse from a Page of TicketWithRecipientInfoResponse
     */
    public static PaginatedTicketsResponse fromPage(Page<TicketWithRecipientInfoResponse> ticketsPage) {
        return PaginatedTicketsResponse.builder()
                .tickets(ticketsPage.getContent())
                .page(ticketsPage.getNumber())
                .size(ticketsPage.getSize())
                .totalElements(ticketsPage.getTotalElements())
                .totalPages(ticketsPage.getTotalPages())
                .build();
    }
}
