package com.ticket.servermono.ticketcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TicketCheckInResponse {
    
    private boolean success;
    private String message;
    
    /**
     * The time the ticket was checked in, in ISO format
     */
    private String checkedInAt;
    
    /**
     * Information about the ticket owner
     */
    private String ownerName;
}
