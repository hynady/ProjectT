package com.ticket.servermono.occacontext.adapters.dtos.Show;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class OccaShowDataResponse {
    private UUID id;
    private String date;
    private String time;
    private List<PriceInfo> prices;

    @Data
    public static class PriceInfo {
        private UUID id;
        private String type;
        private Double price;
        private Integer available;
    }
}