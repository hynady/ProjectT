package com.ticket.servermono.ticketcontext.infrastructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.ticket.servermono.ticketcontext.entities.Ticket;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    Long countByTicketClassId(UUID ticketClassId);

    @Query("SELECT t FROM Ticket t " +
            "JOIN t.ticketClass tc " +
            "JOIN tc.show s " +
            "WHERE t.endUserId = :userId " +
            "AND t.checkedInAt IS NULL " +
            "AND function('STR_TO_DATE', CONCAT(s.date, ' ', s.time), '%Y-%m-%d %H:%i') > CURRENT_TIMESTAMP")
    List<Ticket> findActiveTicketsByUserId(@Param("userId") UUID userId);

    @Query("SELECT t FROM Ticket t " +
            "JOIN t.ticketClass tc " +
            "JOIN tc.show s " +
            "WHERE t.endUserId = :userId " +
            "AND (t.checkedInAt IS NOT NULL " +
            "OR function('STR_TO_DATE', CONCAT(s.date, ' ', s.time), '%Y-%m-%d %H:%i') <= CURRENT_TIMESTAMP)")
    List<Ticket> findUsedTicketsByUserId(@Param("userId") UUID userId);
}