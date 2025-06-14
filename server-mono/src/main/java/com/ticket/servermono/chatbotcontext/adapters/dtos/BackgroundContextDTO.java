package com.ticket.servermono.chatbotcontext.adapters.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

/**
 * DTO for Background Context requests and responses.
 */
public record BackgroundContextDTO(
    Long id,
    
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    String title,
    
    @NotBlank(message = "Content is required")
    @Size(max = 10000, message = "Content must not exceed 10000 characters")
    String content,
    
    @JsonProperty("isActive")
    Boolean isActive,
    
    Instant createdAt,
    Instant updatedAt
) {
    public BackgroundContextDTO(String title, String content) {
        this(null, title, content, true, null, null);
    }
    
    public BackgroundContextDTO(Long id, String title, String content, Boolean isActive) {
        this(id, title, content, isActive, null, null);
    }
}
