package com.ticket.servermono.authcontext.infrastructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ticket.servermono.authcontext.entities.EndUser;

import java.util.Optional;
import java.util.UUID;

public interface EndUserRepository extends JpaRepository<EndUser, UUID> {
    // The @Where annotation on the entity will automatically filter out deleted users
    Optional<EndUser> findEndUserByEmail(String email);
    
    // This needs an explicit where clause to check non-deleted users
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM EndUser e WHERE e.email = :email AND e.isDeleted != true")
    Boolean existsByEmail(String email);

    @Query(value = "SELECT avatar FROM EndUser e WHERE e.id = :id AND e.isDeleted != true")
    String findAvatarById(@Param("id") UUID id);
}
