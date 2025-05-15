package com.ticket.servermono.ticketcontext.adapters.dtos;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ListTicketsResponse {
    @Data
    @AllArgsConstructor
    public class Ticket {
        private UUID id;
        private String checkedInAt = null;
    }

    @Data
    @AllArgsConstructor
    public class Occa {
        private UUID id;
        private String title;
        private String location;
    }

    @Data
    @AllArgsConstructor
    public class Show {
        private UUID id;
        private String time;
        private String date;
    }

    @Data
    @AllArgsConstructor
    public class TicketClass {
        private UUID id;
        private String type;
        private double price;
    }

    private Ticket ticket;
    private Occa occa;
    private Show show;
    private TicketClass ticketType;
}
