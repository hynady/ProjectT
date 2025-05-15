package com.ticket.servermono.trackingcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationTrackDTO {
    private UUID locationId;
    private int count;
}
