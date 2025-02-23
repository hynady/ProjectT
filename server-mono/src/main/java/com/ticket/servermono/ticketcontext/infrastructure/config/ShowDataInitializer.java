package com.ticket.servermono.ticketcontext.infrastructure.config;

import java.util.Map;
import java.util.UUID;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.ticketcontext.entities.Show;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.ShowRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ShowDataInitializer {

    private final String OCCA_CREATION = "occa_creation";
    
    private final ShowRepository showRepository;
    
    private final TicketClassDataInitializer ticketClassDataInitializer;

    @KafkaListener(topics = OCCA_CREATION)
    public void createShowInit(Map<String, Object> message) {
        try {
            Show show = Show.builder()
                .date(message.get("date").toString())
                .time(message.get("time").toString())
                .occaId(UUID.fromString(message.get("occaId").toString()))
                .build();
            showRepository.save(show);
            ticketClassDataInitializer.initializeTickets();

        } catch (Exception e) {
            throw new RuntimeException("Failed to process message", e);
        }
    }
}
