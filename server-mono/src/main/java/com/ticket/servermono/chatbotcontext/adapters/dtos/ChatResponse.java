package com.ticket.servermono.chatbotcontext.adapters.dtos;

/**
 * Response DTO for chat message replies.
 * 
 * @param reply The AI-generated response message
 */
public record ChatResponse(
    String reply
) {}
