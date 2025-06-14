package com.ticket.servermono.chatbotcontext.repositories;

import com.ticket.servermono.chatbotcontext.entities.BackgroundContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for managing BackgroundContext entities.
 */
@Repository
public interface BackgroundContextRepository extends JpaRepository<BackgroundContext, Long> {
      /**
     * Find all active background contexts ordered by creation date.
     */
    List<BackgroundContext> findByIsActiveTrueOrderByCreatedAtDesc();
    
    /**
     * Find paginated background contexts ordered by active status first, then by update time.
     */
    @Query("SELECT bc FROM BackgroundContext bc ORDER BY bc.isActive DESC, bc.updatedAt DESC")
    Page<BackgroundContext> findAllOrderByActiveFirstThenUpdatedAt(Pageable pageable);
    
    /**
     * Find active context by title.
     */
    Optional<BackgroundContext> findByTitleAndIsActiveTrue(String title);
    
    /**
     * Get the most recent active background context.
     */
    @Query("SELECT bc FROM BackgroundContext bc WHERE bc.isActive = true ORDER BY bc.updatedAt DESC LIMIT 1")
    Optional<BackgroundContext> findMostRecentActiveContext();
      /**
     * Count active contexts.
     */
    long countByIsActiveTrue();
    
    /**
     * Deactivate all contexts except the one with given ID.
     */
    @Query("UPDATE BackgroundContext bc SET bc.isActive = false WHERE bc.id != :excludeId AND bc.isActive = true")
    @Modifying
    int deactivateAllExcept(@Param("excludeId") Long excludeId);
    
    /**
     * Deactivate all contexts.
     */
    @Query("UPDATE BackgroundContext bc SET bc.isActive = false WHERE bc.isActive = true")
    @Modifying
    int deactivateAll();
}
