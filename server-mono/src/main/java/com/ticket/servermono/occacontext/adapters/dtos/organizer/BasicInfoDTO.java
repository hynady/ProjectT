package com.ticket.servermono.occacontext.adapters.dtos.organizer;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BasicInfoDTO {
    private String title;
    private String artist;
    private String location;
    private String address;
    private String organizer;
    private String description;    
    private String bannerUrl;
    private UUID categoryId;
    private UUID regionId;
}