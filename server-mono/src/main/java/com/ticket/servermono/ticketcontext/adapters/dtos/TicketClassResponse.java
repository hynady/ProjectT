package com.ticket.servermono.ticketcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response format for ticket class operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketClassResponse {
    private UUID id;
    private String type;
    private Double price;
    private Integer available;
}