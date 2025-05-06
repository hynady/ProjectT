package com.ticket.servermono.occacontext.adapters.dtos.organizer;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccaAnalyticsResponse {
    private List<OccaAnalyticsItem> data;
    private long total;
    private int page;
    private int pageSize;
    private int totalPages;
}
