package com.ticket.servermono.occacontext.infrastructure.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ticket.servermono.occacontext.adapters.dtos.RegionDTO;
import com.ticket.servermono.occacontext.adapters.dtos.RegionResponseIdName;
import com.ticket.servermono.occacontext.entities.Region;

public interface RegionRepository extends JpaRepository<Region, UUID> {
    
    @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.RegionDTO(" +
       "r.id, r.name, r.image, COUNT(DISTINCT o.id)) " +
       "FROM Region r LEFT JOIN r.venues v LEFT JOIN v.occas o " +
       "GROUP BY r.id, r.name, r.image")
    List<RegionDTO> findAllRegionsWithOccaCount();
    
    Optional<Region> findFirstByName(String name);

    @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.RegionResponseIdName(" +
            "r.id, r.name) " +
            "FROM Region r")
    List<RegionResponseIdName> findIdNameRegion();
}