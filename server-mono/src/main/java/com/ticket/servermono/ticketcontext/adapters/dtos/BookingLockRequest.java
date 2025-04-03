package com.ticket.servermono.ticketcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Request payload for locking tickets during booking
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingLockRequest {
    private String showId;
    private List<TicketItem> tickets;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketItem {
        private String id;        // ID của ticket class
        private String type;      // Loại vé (VIP, Thường, etc.)
        private Integer quantity; // Số lượng vé
    }
}