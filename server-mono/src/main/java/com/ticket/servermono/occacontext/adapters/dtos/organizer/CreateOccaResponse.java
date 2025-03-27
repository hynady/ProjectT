package com.ticket.servermono.occacontext.adapters.dtos.organizer;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOccaResponse {
    private UUID id;
    private String title;
    private String status;
    private String approvalStatus;
    private LocalDateTime updatedAt; // Thêm trường updatedAt
}