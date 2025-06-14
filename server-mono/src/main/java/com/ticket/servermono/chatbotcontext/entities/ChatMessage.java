package com.ticket.servermono.chatbotcontext.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing a chat message in the conversation history.
 * Each message belongs to a specific user and session, with role indicating
 * whether it's from the user or AI model.
 */
@Entity
@Table(name = "chat_messages", indexes = {
    @Index(name = "idx_session_user_timestamp", columnList = "sessionId, userId, timestamp DESC")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String sessionId;

    @Column(nullable = false)
    private String role; // "user" or "model"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private Instant timestamp;

    public ChatMessage(UUID userId, String sessionId, String role, String message, Instant timestamp) {
        this.userId = userId;
        this.sessionId = sessionId;
        this.role = role;
        this.message = message;
        this.timestamp = timestamp;
    }

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }
}
