package com.ticket.servermono.occacontext.adapters.dtos;

import java.util.UUID;
import lombok.Value;

@Value
public class CategoryResponse {
    UUID id;
    String name;
    Long count;
}