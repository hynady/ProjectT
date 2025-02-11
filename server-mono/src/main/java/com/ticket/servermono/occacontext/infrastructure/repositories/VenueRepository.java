package com.ticket.servermono.occacontext.infrastructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ticket.servermono.occacontext.adapters.dtos.VenueResponse;
import com.ticket.servermono.occacontext.entities.Venue;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VenueRepository extends JpaRepository<Venue, UUID> {
    Optional<Venue> findByName(String name);

    @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.VenueResponse(" +
            "v.id, v.name, v.image, v.location, COUNT(o)) " +
            "FROM Venue v LEFT JOIN v.occas o " +
            "GROUP BY v.id, v.name, v.image, v.location")
    List<VenueResponse> findAllVenuesWithCount();
}
