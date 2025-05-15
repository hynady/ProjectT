package com.ticket.servermono.occacontext.adapters.dtos.organizer;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsOverviewResponse {
    private Integer totalReach;
    private List<OccaReachItem> topOccas;
    private List<SourceDistributionItem> sourceDistribution;
    private Period period;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OccaReachItem {
        private String id;
        private String title;
        private Integer reach;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SourceDistributionItem {
        private String name;
        private Integer count;
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
