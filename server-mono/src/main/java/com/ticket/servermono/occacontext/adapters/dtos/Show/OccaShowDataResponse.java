package com.ticket.servermono.occacontext.adapters.dtos.Show;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
public class OccaShowDataResponse {
    private UUID id;
    private LocalDate date;
    private LocalTime time;
    private List<PriceInfo> prices;
    private String saleStatus;

    @Data
    public static class PriceInfo {
        private UUID id;
        private String type;
        private Double price;
        private Integer available;
    }
}