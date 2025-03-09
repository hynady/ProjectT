package com.ticket.servermono.ticketcontext.entities;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.kafka.core.KafkaTemplate;


import jakarta.persistence.PostPersist;
import jakarta.persistence.PostUpdate;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class TicketClassListener {

    private static KafkaTemplate<String, String> kafkaTemplate;
    
    @Autowired
    public void setKafkaTemplate(KafkaTemplate<String, String> template) {
        TicketClassListener.kafkaTemplate = template;
    }
    
    @PostPersist
    @PostUpdate
    public void afterSave(TicketClass ticketClass) {
        if (ticketClass.getShowId() != null && kafkaTemplate != null) {
            log.info("Publishing next show date time for show id: {}", ticketClass.getShowId());
            kafkaTemplate.send("update-next-show-datetime", ticketClass.getShowId().toString());
        } else {
            log.warn("Cannot publish event: kafkaTemplate={}, showId={}", 
                     (kafkaTemplate != null), ticketClass.getShowId());
        }
    }
}