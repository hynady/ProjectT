package com.ticket.servermono.chatbotcontext.adapters.dtos;

import java.time.Instant;

/**
 * DTO for representing chat session information.
 * 
 * @param sessionId The unique session identifier
 * @param lastMessageTimestamp Timestamp of the most recent message in this session
 * @param messageCount Total number of messages in this session
 * @param lastMessage Preview of the last message (truncated if too long)
 */
public record ChatSessionDTO(
    String sessionId,
    Instant lastMessageTimestamp,
    long messageCount,
    String lastMessage
) {}
