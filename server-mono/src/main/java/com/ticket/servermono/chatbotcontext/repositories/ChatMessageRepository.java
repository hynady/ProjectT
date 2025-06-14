package com.ticket.servermono.chatbotcontext.repositories;

import com.ticket.servermono.chatbotcontext.entities.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for ChatMessage entity operations.
 * Provides methods for querying chat messages by session and user.
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    /**
     * Get paginated chat messages for a specific session and user, ordered by timestamp (newest first).
     * 
     * @param sessionId The session ID to filter by
     * @param userId The user ID to filter by
     * @param pageable Pagination information
     * @return Page of chat messages
     */
    Page<ChatMessage> findBySessionIdAndUserIdOrderByTimestampDesc(String sessionId, UUID userId, Pageable pageable);

    /**
     * Count total messages in a session for a specific user.
     * 
     * @param sessionId The session ID to filter by
     * @param userId The user ID to filter by
     * @return Total number of messages
     */
    long countBySessionIdAndUserId(String sessionId, UUID userId);

    /**
     * Get recent chat messages for building context (limited number, ordered by timestamp ascending).
     * 
     * @param sessionId The session ID to filter by
     * @param userId The user ID to filter by
     * @param limit Maximum number of messages to retrieve
     * @return List of recent chat messages
     */
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.sessionId = :sessionId AND cm.userId = :userId " +
           "ORDER BY cm.timestamp DESC LIMIT :limit")
    List<ChatMessage> findRecentMessages(@Param("sessionId") String sessionId, 
                                       @Param("userId") UUID userId, 
                                       @Param("limit") int limit);

    /**
     * Get distinct session IDs for a user with their latest message timestamp.
     * 
     * @param userId The user ID to filter by
     * @param pageable Pagination information
     * @return Page of session IDs ordered by latest message timestamp
     */    @Query("SELECT cm.sessionId FROM ChatMessage cm WHERE cm.userId = :userId " +
           "GROUP BY cm.sessionId ORDER BY MAX(cm.timestamp) DESC")
    Page<String> findSessionsByUserIdOrderByLatestMessage(@Param("userId") UUID userId, Pageable pageable);
}
