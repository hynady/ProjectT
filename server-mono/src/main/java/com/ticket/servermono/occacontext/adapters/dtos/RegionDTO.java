package com.ticket.servermono.occacontext.adapters.dtos;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Value;

@Value
@AllArgsConstructor
public class RegionDTO {
    UUID id;
    String regionName;
    String regionImage;
    Long occaCount;
}