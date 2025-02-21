package com.ticket.servermono.ticketcontext.usecases;

import org.springframework.stereotype.Service;

import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketServices {
    private final TicketRepository ticketRepository;

}
