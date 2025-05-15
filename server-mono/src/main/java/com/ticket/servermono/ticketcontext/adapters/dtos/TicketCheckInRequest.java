package com.ticket.servermono.ticketcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TicketCheckInRequest {
    
    /**
     * The authentication code for the show
     */
    private String showAuthCode;
    
    /**
     * The unique code of the ticket to be checked in
     */
    private String ticketCode;
}
