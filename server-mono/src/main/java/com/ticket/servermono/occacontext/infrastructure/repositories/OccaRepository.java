package com.ticket.servermono.occacontext.infrastructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.adapters.dtos.OccaResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OccaRepository extends JpaRepository<Occa, UUID> {
    Optional<Occa> findByTitle(String title);
    
    List<Occa> findFirst6ByOrderByIdDesc();

    @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.OccaResponse(" +
           "o.id, o.title, o.image, o.date, o.time, o.location, o.price, " +
           "o.category.id, o.venue.id) " +
           "FROM Occa o " +
           "ORDER BY o.id DESC")
    List<OccaResponse> findFirst6HeroOccas(Pageable pageable);
}
