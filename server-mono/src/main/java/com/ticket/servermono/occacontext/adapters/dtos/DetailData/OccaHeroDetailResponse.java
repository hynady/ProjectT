package com.ticket.servermono.occacontext.adapters.dtos.DetailData;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class OccaHeroDetailResponse {
    private UUID id;
    private String title;
    private String artist;
    private String bannerUrl;
    private String date;
    private String time;
    private String duration;
    private String location;
}
