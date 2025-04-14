package com.ticket.servermono.authcontext.infrastructure.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ticket.servermono.authcontext.domain.enums.UserStatus;
import com.ticket.servermono.authcontext.entities.EndUser;

import java.util.Optional;
import java.util.UUID;

public interface EndUserRepository extends JpaRepository<EndUser, UUID> {
    // The @Where annotation on the entity will automatically filter out deleted users
    Optional<EndUser> findEndUserByEmail(String email);
      // This needs an explicit where clause to check active users
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM EndUser e WHERE e.email = :email AND e.activatedStatus = 'ACTIVE'")
    Boolean existsByEmail(String email);    @Query(value = "SELECT avatar FROM EndUser e WHERE e.id = :id AND e.activatedStatus = 'ACTIVE'")
    String findAvatarById(@Param("id") UUID id);
    
    /**
     * Find all users with a specific role with pagination and optional search
     */
    @Query("SELECT e FROM EndUser e WHERE e.roles LIKE %:role% " +
           "AND (:status IS NULL OR e.activatedStatus = :status) " +
           "AND (:search IS NULL OR LOWER(e.name) LIKE %:search% OR LOWER(e.email) LIKE %:search%)")    Page<EndUser> findByRoleAndDeletedStatusAndSearch(@Param("role") String role, @Param("status") UserStatus status, 
                                                      @Param("search") String search, Pageable pageable);
}
