package com.ticket.servermono.occacontext.adapters.dtos.DetailData;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class OccaHeroDetailResponse {
    private UUID id;
    private String title;
    private String artist;
    private String bannerUrl;
    private LocalDate date;
    private LocalTime time;
    private String location;
    private String category;
    private String region;
}
