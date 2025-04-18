package com.ticket.servermono.occacontext.infrastructure.repositories;

import com.ticket.servermono.occacontext.entities.PersonalTrackingStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PersonalTrackingStatsRepository extends JpaRepository<PersonalTrackingStats, UUID> {
    
    Optional<PersonalTrackingStats> findByUserIdAndTypeAndTypeId(UUID userId, PersonalTrackingStats.TrackingType type, UUID typeId);
    
    List<PersonalTrackingStats> findByUserIdAndTypeOrderByCountDesc(UUID userId, PersonalTrackingStats.TrackingType type);
}
