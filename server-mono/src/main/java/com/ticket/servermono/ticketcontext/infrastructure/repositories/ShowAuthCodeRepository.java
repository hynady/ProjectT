package com.ticket.servermono.ticketcontext.infrastructure.repositories;

import com.ticket.servermono.ticketcontext.entities.ShowAuthCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShowAuthCodeRepository extends JpaRepository<ShowAuthCode, UUID> {
    
    /**
     * Find auth code by show ID
     */
    Optional<ShowAuthCode> findByShowId(UUID showId);
    
    /**
     * Find all expired auth codes (ones that need to be refreshed)
     */
    List<ShowAuthCode> findByExpiresAtBefore(LocalDateTime dateTime);
    
    /**
     * Find all show auth codes that don't have a corresponding ticket class anymore
     */
    @Query("SELECT sac FROM ShowAuthCode sac WHERE NOT EXISTS " +
           "(SELECT 1 FROM TicketClass tc WHERE tc.showId = sac.showId)")
    List<ShowAuthCode> findAllWithoutTicketClass();
    
    /**
     * Find auth code by the code value
     */
    Optional<ShowAuthCode> findByAuthCode(String authCode);
}
