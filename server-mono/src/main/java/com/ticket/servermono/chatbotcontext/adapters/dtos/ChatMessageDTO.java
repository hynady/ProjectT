package com.ticket.servermono.chatbotcontext.adapters.dtos;

import java.time.Instant;

/**
 * DTO for representing chat message history.
 * 
 * @param role The role of the message sender ("user" or "model")
 * @param message The message content
 * @param timestamp When the message was sent
 */
public record ChatMessageDTO(
    String role,
    String message,
    Instant timestamp
) {}
