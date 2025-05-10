package com.ticket.servermono.ticketcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for show authentication codes
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShowAuthCodeResponse {
    private String authCode;
    private LocalDateTime expiresAt;
}
