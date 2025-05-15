package com.ticket.servermono.authcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatDTO {
    private int eventsAttended;
    private int eventsOrganized;
    private int ticketsPurchased;
    private BigDecimal totalSpent;
}
