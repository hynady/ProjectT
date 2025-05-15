package com.ticket.servermono.ticketcontext.adapters.dtos;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response format for revenue overview analytics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueOverviewResponse {
    private Double totalRevenue;
    private List<RevenueDistributionItem> revenueDistribution;
    private Period period;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueDistributionItem {
        private String name;
        private Double amount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Period {
        private LocalDateTime from;
        private LocalDateTime to;
    }
}
