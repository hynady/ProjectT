package com.ticket.servermono.ticketcontext.infrastructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ticket.servermono.ticketcontext.entities.TicketClass;
import java.util.List;
import java.util.UUID;

@Repository
public interface TicketClassRepository extends JpaRepository<TicketClass, UUID> {
    @Query("SELECT tc FROM TicketClass tc JOIN tc.tickets t WHERE t.show.id = :showId GROUP BY tc")
    List<TicketClass> findByShowId(@Param("showId") UUID showId);
}