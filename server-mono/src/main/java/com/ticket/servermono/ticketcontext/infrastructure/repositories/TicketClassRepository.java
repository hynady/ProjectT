package com.ticket.servermono.ticketcontext.infrastructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ticket.servermono.ticketcontext.entities.TicketClass;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketClassRepository extends JpaRepository<TicketClass, UUID> {
    List<TicketClass> findByShowId(UUID showId);
    
    long countByShowId(UUID showId);
}