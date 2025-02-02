package com.ticket.userserver.features.auth.repositories;

import com.ticket.userserver.features.auth.models.EndUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EndUserRepository extends JpaRepository<EndUser, UUID> {
    Optional<EndUser> findEndUserByEmail(String email);
    Boolean existsByEmail(String email);
}
