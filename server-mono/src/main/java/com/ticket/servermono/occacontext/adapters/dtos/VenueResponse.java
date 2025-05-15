package com.ticket.servermono.occacontext.adapters.dtos;

import java.util.UUID;
import lombok.Value;

@Value
public class VenueResponse {
    UUID id;
    String region;
    String image;
    String location;
    Long occaCount;
}