package com.ticket.servermono.occacontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
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