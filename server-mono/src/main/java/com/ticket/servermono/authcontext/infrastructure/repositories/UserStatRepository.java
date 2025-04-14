package com.ticket.servermono.authcontext.infrastructure.repositories;

import com.ticket.servermono.authcontext.entities.UserStat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserStatRepository extends JpaRepository<UserStat, UUID> {
    Optional<UserStat> findByUserId(UUID userId);
}
