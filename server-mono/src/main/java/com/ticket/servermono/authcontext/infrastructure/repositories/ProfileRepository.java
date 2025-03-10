package com.ticket.servermono.authcontext.infrastructure.repositories;

import com.ticket.servermono.authcontext.entities.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    
    // Updated query to fetch profiles directly via user association
    @Query("SELECT p FROM Profile p WHERE p.user.id = :userId AND p.user.isDeleted = false")
    List<Profile> findByUserId(@Param("userId") UUID userId);
}
