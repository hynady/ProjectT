package com.ticket.servermono.occacontext.adapters.dtos;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Value;

@Value
@AllArgsConstructor
public class RegionResponseIdName {
    UUID id;
    String name;
}