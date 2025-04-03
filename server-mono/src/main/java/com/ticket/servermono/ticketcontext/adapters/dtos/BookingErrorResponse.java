package com.ticket.servermono.ticketcontext.adapters.dtos;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Error response for booking operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingErrorResponse {
    private LocalDateTime timestamp;
    private Integer status;
    private String error;
    private String message;
    private String path;
}