package com.ticket.servermono.ticketcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for adding a new ticket class
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddTicketClassRequest {
    private String type;
    private Double price;
    private Integer availableQuantity;
}