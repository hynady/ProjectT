package com.ticket.servermono.occacontext.adapters.dtos.Show;

import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Response format for show operations
 */
@Data
public class ShowResponse {
    private UUID id;
    private String date;
    private String time;
    private String saleStatus; // 'upcoming', 'on_sale', 'sold_out', 'ended'
    private Boolean autoUpdateStatus; // Tự động cập nhật trạng thái (true/false)
    private List<TicketInfo> tickets;

    @Data
    public static class TicketInfo {
        private UUID id;
        private String type;
        private Double price;
        private Integer available;
        private Integer sold; // Optional field
    }
}