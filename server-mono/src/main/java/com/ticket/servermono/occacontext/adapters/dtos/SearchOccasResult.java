package com.ticket.servermono.occacontext.adapters.dtos;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class SearchOccasResult {
    private List<OccaResponse> occas;
    private int totalPages;
    private long totalElements;
}
