package com.ticket.servermono.occacontext.infrastructure.repositories;

import com.ticket.servermono.occacontext.entities.OccaTrackingStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OccaTrackingStatsRepository extends JpaRepository<OccaTrackingStats, UUID> {
}
