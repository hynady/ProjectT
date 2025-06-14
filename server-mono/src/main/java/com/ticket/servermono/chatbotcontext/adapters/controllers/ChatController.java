package com.ticket.servermono.chatbotcontext.adapters.controllers;

import com.ticket.servermono.chatbotcontext.adapters.dtos.ChatMessageDTO;
import com.ticket.servermono.chatbotcontext.adapters.dtos.ChatRequest;
import com.ticket.servermono.chatbotcontext.adapters.dtos.ChatResponse;
import com.ticket.servermono.chatbotcontext.adapters.dtos.ChatSessionDTO;
import com.ticket.servermono.chatbotcontext.usecases.ChatService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for chatbot functionality.
 * Provides endpoints for sending messages and retrieving chat history.
 */
@RestController
@RequestMapping("/v1/chat")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("isAuthenticated()")
@Validated
public class ChatController {

    private final ChatService chatService;

    /**
     * Send a message to the chatbot and receive a response.
     * 
     * @param request The chat request containing sessionId and message
     * @param principal The authenticated user
     * @return ChatResponse with AI-generated reply
     */
    @PostMapping("/send")
    public ResponseEntity<ChatResponse> sendMessage(
            @Valid @RequestBody ChatRequest request,
            Principal principal) {
        
        try {
            UUID userId = UUID.fromString(principal.getName());
            log.debug("Processing chat message for user {} in session {}", userId, request.sessionId());
            
            String reply = chatService.handleMessage(userId, request.sessionId(), request.message());
            
            return ResponseEntity.ok(new ChatResponse(reply));
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format: {}", principal.getName(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error processing chat message", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Retrieve paginated chat history for a specific session.
     * 
     * @param sessionId The session ID to retrieve history for
     * @param page Page number (0-based, default: 0)
     * @param size Number of messages per page (default: 20, max: 100)
     * @param principal The authenticated user
     * @return List of ChatMessageDTO objects
     */
    @GetMapping("/history")
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(
            @RequestParam @NotBlank String sessionId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            Principal principal) {
        
        try {
            UUID userId = UUID.fromString(principal.getName());
            log.debug("Retrieving chat history for user {} in session {}, page {} size {}", 
                userId, sessionId, page, size);
            
            List<ChatMessageDTO> history = chatService.getHistory(userId, sessionId, page, size);
            
            return ResponseEntity.ok(history);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format: {}", principal.getName(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error retrieving chat history", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get the total number of messages in a session.
     * 
     * @param sessionId The session ID to count messages for
     * @param principal The authenticated user
     * @return Total message count
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getMessageCount(
            @RequestParam @NotBlank String sessionId,
            Principal principal) {
        
        try {
            UUID userId = UUID.fromString(principal.getName());
            log.debug("Getting message count for user {} in session {}", userId, sessionId);
            
            long count = chatService.getMessageCount(userId, sessionId);
            
            return ResponseEntity.ok(count);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format: {}", principal.getName(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error getting message count", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get paginated list of user's chat sessions, ordered by latest message timestamp.
     * 
     * @param page Page number (0-based, default: 0)
     * @param size Number of sessions per page (default: 10, max: 50)
     * @param principal The authenticated user
     * @return List of ChatSessionDTO objects
     */
    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSessionDTO>> getUserSessions(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size,
            Principal principal) {
        
        try {
            UUID userId = UUID.fromString(principal.getName());
            log.debug("Retrieving sessions for user {}, page {} size {}", userId, page, size);
            
            List<ChatSessionDTO> sessions = chatService.getUserSessions(userId, page, size);
            
            return ResponseEntity.ok(sessions);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format: {}", principal.getName(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error retrieving user sessions", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get the total number of sessions for the authenticated user.
     * 
     * @param principal The authenticated user
     * @return Total session count
     */
    @GetMapping("/sessions/count")
    public ResponseEntity<Long> getUserSessionCount(Principal principal) {
        
        try {
            UUID userId = UUID.fromString(principal.getName());
            log.debug("Getting session count for user {}", userId);
            
            long count = chatService.getUserSessionCount(userId);
            
            return ResponseEntity.ok(count);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format: {}", principal.getName(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error getting session count", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
