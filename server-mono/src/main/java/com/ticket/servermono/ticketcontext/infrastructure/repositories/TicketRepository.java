package com.ticket.servermono.ticketcontext.infrastructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.ticket.servermono.ticketcontext.entities.Ticket;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findByEndUserId(UUID endUserId);
    
    List<Ticket> findByEndUserIdAndCheckedInAtIsNull(UUID endUserId);
    
    Long countByTicketClassId(UUID ticketClassId);
    
    Long countByTicketClassIdAndEndUserIdIsNotNull(UUID ticketClassId);

    List<Ticket> findAllByEndUserIdIsNotNull();      /**
     * Calculate total revenue for an occa by summing up the price of all purchased tickets
     * Note: showIds must be provided from the OccaContext since we can't directly reference it here
     */
    @Query("SELECT SUM(tc.price) FROM Ticket t " +
           "JOIN t.ticketClass tc " +
           "WHERE tc.showId IN :showIds " +
           "AND t.endUserId IS NOT NULL " +
           "AND t.createdAt BETWEEN :startDate AND :endDate")
    Long calculateRevenueByShowIds(@Param("showIds") List<UUID> showIds, 
                                 @Param("startDate") LocalDateTime startDate, 
                                 @Param("endDate") LocalDateTime endDate);      /**
     * Calculate fill rate as percentage (0-100) of sold tickets vs total capacity for shows
     * Note: showIds must be provided from the OccaContext since we can't directly reference it here
     */
    @Query("SELECT CAST(COUNT(t) * 100.0 / " +
           "(SELECT SUM(tc2.capacity) FROM TicketClass tc2 WHERE tc2.showId IN :showIds) AS INTEGER) " +
           "FROM Ticket t " +
           "JOIN t.ticketClass tc " +
           "WHERE tc.showId IN :showIds " +
           "AND t.endUserId IS NOT NULL " +
           "AND t.createdAt BETWEEN :startDate AND :endDate")
    Integer calculateFillRateByShowIds(@Param("showIds") List<UUID> showIds,
                                     @Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate);
}
