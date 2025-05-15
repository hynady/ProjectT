package com.ticket.servermono.occacontext.adapters.dtos.organizer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyVisitorsItem {
    private String date;  // Format: dd/MM
    private Integer visitors;
}
