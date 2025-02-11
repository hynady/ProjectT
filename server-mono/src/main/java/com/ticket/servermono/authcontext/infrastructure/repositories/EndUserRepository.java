package com.ticket.servermono.authcontext.infrastructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ticket.servermono.authcontext.entities.EndUser;

import java.util.Optional;
import java.util.UUID;

public interface EndUserRepository extends JpaRepository<EndUser, UUID> {
    Optional<EndUser> findEndUserByEmail(String email);
    Boolean existsByEmail(String email);
}
