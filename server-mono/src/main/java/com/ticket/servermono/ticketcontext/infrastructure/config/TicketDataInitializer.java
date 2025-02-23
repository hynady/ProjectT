package com.ticket.servermono.ticketcontext.infrastructure.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import java.util.ArrayList;
import java.util.List;

import com.ticket.servermono.ticketcontext.entities.Show;
import com.ticket.servermono.ticketcontext.entities.Ticket;
import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.ShowRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketRepository;

@Configuration
public class TicketDataInitializer {
    @Bean
    @Order(4) // Execute after Show and TicketClass initialization
    CommandLineRunner initTicketData(
            ShowRepository showRepository,
            TicketClassRepository ticketClassRepository,
            TicketRepository ticketRepository) {
        return args -> {
            if (ticketRepository.count() == 0) {

                List<Show> shows = showRepository.findAll();
                List<TicketClass> ticketClasses = ticketClassRepository.findAll();
                List<Ticket> tickets = new ArrayList<>();

                for (Show show : shows) {
                    for (TicketClass ticketClass : ticketClasses) {
                        // Create 10 tickets for each show and class combination
                        for (int i = 0; i < 10; i++) {
                            tickets.add(Ticket.builder()
                                    .show(show)
                                    .ticketClass(ticketClass)
                                    .build());
                        }
                    }
                }
                ticketRepository.saveAll(tickets);
            }
        };
    }
}