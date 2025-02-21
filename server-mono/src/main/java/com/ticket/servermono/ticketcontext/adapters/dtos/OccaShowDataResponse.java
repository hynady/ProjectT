package com.ticket.servermono.ticketcontext.adapters.dtos;

import lombok.Data;
import java.util.List;

@Data
public class OccaShowDataResponse {
    private String date;
    private String time;
    private List<PriceInfo> prices;

    @Data
    public static class PriceInfo {
        private String type;
        private Double price;
        private Integer available;
    }
}