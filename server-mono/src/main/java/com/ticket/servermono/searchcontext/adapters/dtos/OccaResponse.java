package com.ticket.servermono.searchcontext.adapters.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class OccaResponse {
    private UUID id;
    private String title;
    private String image;
    private LocalDate date;
    private LocalTime time; 
    private String location;
    private Double price;
    private UUID categoryId;
    private UUID venueId;
}