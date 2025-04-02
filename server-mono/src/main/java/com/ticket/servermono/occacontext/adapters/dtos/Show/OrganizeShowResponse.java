package com.ticket.servermono.occacontext.adapters.dtos.Show;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class OrganizeShowResponse {
    private UUID id;
    private String date;
    private String time;
    private String saleStatus; // "on_sale" or "upcoming"
    private List<TicketInfo> tickets;

    @Data
    public static class TicketInfo {
        private UUID id;
        private String type;
        private Double price;
        private Integer available;
    }
}