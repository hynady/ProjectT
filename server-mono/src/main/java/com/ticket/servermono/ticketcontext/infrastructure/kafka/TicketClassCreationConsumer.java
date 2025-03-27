package com.ticket.servermono.ticketcontext.infrastructure.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.ticketcontext.adapters.dtos.TicketClassCreateDTO;
import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class TicketClassCreationConsumer {

    private final TicketClassRepository ticketClassRepository;

    @Transactional
    @KafkaListener(topics = "ticket-class-create")
    public void handleTicketClassCreation(TicketClassCreateDTO dto) {
        try {
            log.info("Received message to create ticket class: {}", dto);
            
            // Create new TicketClass entity
            TicketClass ticketClass = TicketClass.builder()
                    .name(dto.getType())
                    .price(dto.getPrice())
                    .capacity(dto.getAvailableQuantity())
                    .showId(dto.getShowId())
                    .build();
            
            // Save to database
            ticketClass = ticketClassRepository.save(ticketClass);
            log.info("Successfully created ticket class with ID: {} for show: {}", 
                    ticketClass.getId(), ticketClass.getShowId());
            
        } catch (Exception e) {
            log.error("Error processing ticket class creation: {}", e.getMessage(), e);
        }
    }
}