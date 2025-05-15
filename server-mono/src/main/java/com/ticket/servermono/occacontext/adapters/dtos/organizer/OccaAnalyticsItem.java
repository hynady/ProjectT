package com.ticket.servermono.occacontext.adapters.dtos.organizer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccaAnalyticsItem {
    private String id;
    private String title;
    private int reach;
    private long revenue;
    private int fillRate;
}
