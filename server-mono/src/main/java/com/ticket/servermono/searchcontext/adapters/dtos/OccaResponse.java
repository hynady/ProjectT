package com.ticket.servermono.searchcontext.adapters.dtos;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class OccaResponse {
    private UUID id;
    private String title;
    private String image;
    private String date;
    private String time; 
    private String location;
    private String price;
    private UUID categoryId;
    private UUID venueId;
}