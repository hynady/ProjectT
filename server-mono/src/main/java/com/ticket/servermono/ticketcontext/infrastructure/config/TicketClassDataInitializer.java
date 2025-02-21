package com.ticket.servermono.ticketcontext.infrastructure.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.Arrays;

import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;

@Configuration
public class TicketClassDataInitializer {
    @Bean
    CommandLineRunner initTicketClassData(TicketClassRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                TicketClass[] ticketClasses = {
                    TicketClass.builder()
                        .name("VIP")
                        .price(1000000.0)
                        .build(),
                    TicketClass.builder()
                        .name("Regular")
                        .price(500000.0)
                        .build(),
                    TicketClass.builder()
                        .name("Economy")
                        .price(200000.0)
                        .build()
                };
                repository.saveAll(Arrays.asList(ticketClasses));
            }
        };
    }
}