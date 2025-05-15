package com.ticket.servermono.trackingcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OccaTrackDTO {
    private UUID occaId;
    private Map<String, Integer> sources;
    private int totalCount;
}
