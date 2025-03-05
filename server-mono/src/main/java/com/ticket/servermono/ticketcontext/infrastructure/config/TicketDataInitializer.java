package com.ticket.servermono.ticketcontext.infrastructure.config;

import org.springframework.stereotype.Component;

import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketRepository;
import com.ticket.servermono.ticketcontext.usecases.TicketServices;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TicketDataInitializer {
    private final TicketRepository ticketRepository;
    private final TicketServices ticketServices;
    private final TicketClassRepository ticketClassRepository;

    public void initializeTickets() {
        // Check if there are no tickets, then initialize random 2-4 tickets each ticket class through function sellTicket in TicketService
        if (ticketRepository.count() == 0) {
            ticketClassRepository.findAll().forEach(ticketClass -> {
                int ticketCount = (int) (Math.random() * (4 - 2 + 1)) + 2;
                for (int i = 0; i < ticketCount; i++) {
                    ticketServices.sellTicket(ticketClass.getId());
                }
            });
        }
        
    }
}