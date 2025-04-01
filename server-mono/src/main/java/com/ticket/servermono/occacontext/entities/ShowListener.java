package com.ticket.servermono.occacontext.entities;

import org.springframework.stereotype.Component;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;


import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class ShowListener {

    private static KafkaTemplate<String, String> kafkaTemplate;
    
    @Autowired
    public void setKafkaTemplate(KafkaTemplate<String, String> template) {
        ShowListener.kafkaTemplate = template;
    }
    
    @PostPersist
    @PostUpdate
    public void afterChange(Show show) {
        if (kafkaTemplate != null && show.getOcca() != null && show.getOcca().getId() != null) {
            UUID occaId = show.getOcca().getId();
            log.info("Publishing update next show date time for occa id: {}", occaId);
            kafkaTemplate.send("update-next-show-datetime", occaId.toString());
        } else {
            log.warn("Cannot publish event: kafkaTemplate={}, occaId={}", 
                     (kafkaTemplate != null), (show.getOcca() != null ? show.getOcca().getId() : null));
        }
    }
    
    @PostRemove
    public void afterRemove(Show show) {
        if (kafkaTemplate != null && show.getOcca() != null && show.getOcca().getId() != null) {
            UUID occaId = show.getOcca().getId();
            log.info("Publishing update next show date time for occa id: {}", occaId);
            kafkaTemplate.send("update-next-show-datetime", occaId.toString());
            log.info("Publishing cascade delete show for show id: {}", show.getId());
            kafkaTemplate.send("cascade-delete-show", show.getId().toString());
        } else {
            log.warn("Cannot publish event: kafkaTemplate={}, occaId={}", 
                     (kafkaTemplate != null), (show.getOcca() != null ? show.getOcca().getId() : null));
        }
    }
}