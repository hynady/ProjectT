package com.ticket.servermono.searchcontext.adapters.dtos;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SearchPageResponse {
    private List<OccaResponse> occas;
    private int totalPages;
    private long totalElements;
}