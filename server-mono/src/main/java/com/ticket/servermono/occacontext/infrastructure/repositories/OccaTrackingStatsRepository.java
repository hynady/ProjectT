package com.ticket.servermono.occacontext.infrastructure.repositories;

import com.ticket.servermono.occacontext.entities.OccaTrackingStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OccaTrackingStatsRepository extends JpaRepository<OccaTrackingStats, UUID> {
    /**
     * Find OccaTrackingStats within a date range
     */
    @Query("SELECT o FROM OccaTrackingStats o WHERE o.lastUpdated BETWEEN :startDate AND :endDate")
    List<OccaTrackingStats> findByLastUpdatedBetween(
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );
    
    /**
     * Find OccaTrackingStats within a date range for specific occaIds
     */
    @Query("SELECT o FROM OccaTrackingStats o WHERE o.occaId IN :occaIds AND o.lastUpdated BETWEEN :startDate AND :endDate")
    List<OccaTrackingStats> findByOccaIdInAndLastUpdatedBetween(
        @Param("occaIds") List<UUID> occaIds,
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );
}
