package com.ticket.servermono.ticketcontext.infrastructure.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    
    /**
     * Find tickets by user ID with pagination support
     * @param endUserId The user ID to filter by
     * @param pageable Pagination information
     * @return Paginated list of tickets
     */
    Page<Ticket> findByEndUserId(UUID endUserId, Pageable pageable);
    
    /**
     * Find tickets by user ID with check-in status filter and pagination
     * @param endUserId The user ID to filter by
     * @param pageable Pagination information
     * @return Paginated list of tickets that haven't been checked in
     */
    Page<Ticket> findByEndUserIdAndCheckedInAtIsNull(UUID endUserId, Pageable pageable);
    
    /**
     * Find tickets by user ID with check-in status filter and pagination
     * @param endUserId The user ID to filter by
     * @param pageable Pagination information
     * @return Paginated list of tickets that have been checked in
     */
    Page<Ticket> findByEndUserIdAndCheckedInAtIsNotNull(UUID endUserId, Pageable pageable);
    
    Long countByTicketClassId(UUID ticketClassId);
      
    Long countByTicketClassIdAndEndUserIdIsNotNull(UUID ticketClassId);    List<Ticket> findByTicketClassIdAndEndUserIdIsNotNull(UUID ticketClassId);    /**
     * Find all tickets for a specific show with pagination
     * Uses the invoice.status = 'PAYMENT_SUCCESS' filter to ensure only paid tickets are returned
     */
    @Query(value = "SELECT t FROM Ticket t JOIN FETCH t.ticketClass tc JOIN FETCH t.invoice i " +
                  "WHERE tc.showId = :showId AND i.status = 'PAYMENT_SUCCESS'",
           countQuery = "SELECT COUNT(t) FROM Ticket t JOIN t.ticketClass tc JOIN t.invoice i " +
                        "WHERE tc.showId = :showId AND i.status = 'PAYMENT_SUCCESS'")
    Page<Ticket> findByTicketClassShowIdAndInvoicePaid(@Param("showId") UUID showId, Pageable pageable);
    
    List<Ticket> findAllByEndUserIdIsNotNull();/**
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
                                 @Param("endDate") LocalDateTime endDate);
                                    
    /**
     * Get the total number of sold tickets for a list of shows up to the end date
     * This method ignores the start date
     */
    @Query("SELECT COUNT(t) FROM Ticket t " +
           "JOIN t.ticketClass tc " +
           "WHERE tc.showId IN :showIds " +
           "AND t.endUserId IS NOT NULL " +
           "AND t.createdAt <= :endDate")
    Long countTotalSoldTicketsUntilDate(@Param("showIds") List<UUID> showIds,
                                        @Param("endDate") LocalDateTime endDate);
                                        
    /**
     * Get the total capacity for a list of shows
     */    @Query("SELECT SUM(tc.capacity) FROM TicketClass tc WHERE tc.showId IN :showIds")
    Integer getTotalCapacityByShowIds(@Param("showIds") List<UUID> showIds);
    
    /**
     * Calculate revenue statistics for each ticket class in a show
     * Returns an array of Object[] where each element contains:
     * - ticketClassId (UUID)
     * - ticketClassName (String)
     * - ticketsSold (Long)
     * - totalRevenue (Double)
     */
    @Query("SELECT tc.id, tc.name, COUNT(t.id), SUM(tc.price) " +
           "FROM Ticket t " +
           "JOIN t.ticketClass tc " +
           "JOIN t.invoice i " +
           "WHERE tc.showId = :showId " +
           "AND i.status = 'PAYMENT_SUCCESS' " +
           "AND t.endUserId IS NOT NULL " +
           "GROUP BY tc.id, tc.name")
    List<Object[]> getRevenueByTicketClassForShow(@Param("showId") UUID showId);
}
