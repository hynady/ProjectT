package com.ticket.servermono.occacontext.adapters.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class OccaProjection {
    private UUID id;
    private String title;
    private String image;
    private LocalDateTime nextShowDateTime;
    private String location;
    private UUID categoryId;
    private UUID venueId;
    private Double minPrice;

    public LocalDate getDate() {
        return nextShowDateTime != null ? nextShowDateTime.toLocalDate() : null;
    }
    
    public LocalTime getTime() {
        return nextShowDateTime != null ? nextShowDateTime.toLocalTime() : null;
    }
}
