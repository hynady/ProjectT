package com.ticket.servermono.ticketcontext.usecases;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.ticketcontext.entities.Ticket;
import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketServices {
    private final TicketClassRepository ticketClassRepository;
    private final TicketRepository ticketRepository;
    private final ShowServices showServices;

    // TODO: UserId should be passed as a parameter
    @Transactional
    public void sellTicket(UUID ticketClassId) {
        try{
            //check if ticket class exists
            TicketClass ticketClass  = ticketClassRepository.findById(ticketClassId)
                    .orElseThrow(() -> new IllegalStateException("Ticket class not found"));
            //check if ticket is available
            if (showServices.isSoldOut(ticketClass)) {
                throw new IllegalStateException("Ticket class is sold out");
            }
            // Generate ticket for user and save
            Ticket sellTicket = new Ticket(ticketClass);
            ticketRepository.save(sellTicket);
            
        } catch (Exception e) {

            e.printStackTrace();
        }
    }
    
}
