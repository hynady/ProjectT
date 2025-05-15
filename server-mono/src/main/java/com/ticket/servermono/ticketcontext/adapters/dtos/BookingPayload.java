package com.ticket.servermono.ticketcontext.adapters.dtos;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class BookingPayload {
    @Data
    @AllArgsConstructor
    @Builder
    public static class TicketPayload {
        private UUID id;
        private String type;
        private int quantity;
    }

    private UUID showId;
    private List<TicketPayload> tickets;
}
