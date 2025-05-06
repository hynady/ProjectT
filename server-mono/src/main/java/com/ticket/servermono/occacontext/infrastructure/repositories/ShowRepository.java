package com.ticket.servermono.occacontext.infrastructure.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ticket.servermono.occacontext.entities.Show;

public interface ShowRepository extends JpaRepository<Show, UUID> {
    List<Show> findByOccaId(UUID occaId);
    List<Show> findByCreatedBy(UUID userId);
}
