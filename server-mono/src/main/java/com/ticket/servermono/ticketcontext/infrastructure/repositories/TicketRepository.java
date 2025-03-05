package com.ticket.servermono.ticketcontext.infrastructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ticket.servermono.ticketcontext.entities.Ticket;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    Long countByTicketClassId(UUID ticketClassId);

    List<Ticket> findByEndUserIdAndCheckedInAtIsNull(UUID endUserId);
    
    List<Ticket> findByEndUserId(UUID endUserId);
}