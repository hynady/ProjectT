package com.ticket.servermono.chatbotcontext.adapters.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for sending a chat message.
 * 
 * @param sessionId The session identifier for the conversation
 * @param message The user's message content
 */
public record ChatRequest(
    @NotBlank(message = "Session ID cannot be empty")
    String sessionId,
    
    @NotBlank(message = "Message cannot be empty")
    @Size(max = 4000, message = "Message cannot exceed 4000 characters")
    String message
) {}
