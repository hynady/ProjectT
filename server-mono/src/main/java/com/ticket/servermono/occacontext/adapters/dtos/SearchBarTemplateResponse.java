package com.ticket.servermono.occacontext.adapters.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchBarTemplateResponse {
    private UUID id;
    private String title;
    private LocalDateTime showDateTime;
    private String location;
    
    // Để tương thích ngược với mã hiện có
    public LocalDate getDate() {
        return showDateTime != null ? showDateTime.toLocalDate() : null;
    }
}