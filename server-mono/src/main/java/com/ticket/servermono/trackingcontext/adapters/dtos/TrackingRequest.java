package com.ticket.servermono.trackingcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrackingRequest {
    private List<CategoryTrackDTO> topCategories;
    private List<LocationTrackDTO> topLocations;
    private List<OccaTrackDTO> topOccas;
}
