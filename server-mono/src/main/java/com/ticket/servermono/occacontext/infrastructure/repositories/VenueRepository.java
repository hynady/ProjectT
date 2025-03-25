package com.ticket.servermono.occacontext.infrastructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ticket.servermono.occacontext.adapters.dtos.VenueResponse;
import com.ticket.servermono.occacontext.adapters.dtos.DetailData.LocationDataResponse;
import com.ticket.servermono.occacontext.entities.Venue;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VenueRepository extends JpaRepository<Venue, UUID> {

    @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.VenueResponse(" +
            "v.id, v.region.name, v.region.image, v.location, COUNT(o)) " +
            "FROM Venue v LEFT JOIN v.occas o " +
            "GROUP BY v.id, v.region.name, v.region.image, v.location")
    List<VenueResponse> findAllVenuesWithCount();
    
    @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.VenueResponse(" +
            "v.id, v.region.name, v.region.image, v.location, COUNT(o)) " +
            "FROM Venue v LEFT JOIN v.occas o " +
            "WHERE v.region.id = :regionId " +
            "GROUP BY v.id, v.region.name, v.region.image, v.location")
    List<VenueResponse> findVenuesByRegionWithCount(@Param("regionId") UUID regionId);

    Optional<Venue> findByLocation(String location);
    
    Optional<Venue> findFirstByLocation(String location);

    @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.DetailData.LocationDataResponse(" +
    "v.location, v.address) " +
    "FROM Venue v " +
    "JOIN v.occas o " +
    "WHERE o.id = :occaId")
    Optional<LocationDataResponse> findLocationByOccaId(@Param("occaId") UUID occaId);
}
