package com.ticket.servermono.chatbotcontext.usecases;

import com.ticket.servermono.chatbotcontext.adapters.clients.GeminiClient;
import com.ticket.servermono.chatbotcontext.adapters.dtos.ChatMessageDTO;
import com.ticket.servermono.chatbotcontext.adapters.dtos.ChatSessionDTO;
import com.ticket.servermono.chatbotcontext.entities.ChatMessage;
import com.ticket.servermono.chatbotcontext.repositories.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Service for handling chat operations including message processing,
 * AI response generation, and conversation history management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final GeminiClient geminiClient;
    private final BackgroundContextService backgroundContextService;
    
    private static final int CONTEXT_LIMIT = 10; // Number of recent messages to use as context

    /**
     * Handle incoming user messages and generate AI responses.
     * 
     * @param userId The ID of the user sending the message
     * @param sessionId The session ID for the conversation
     * @param userMessage The user's message content
     * @return AI-generated response
     */
    @Transactional
    public String handleMessage(UUID userId, String sessionId, String userMessage) {
        log.debug("Handling message for user {} in session {}", userId, sessionId);
        
        // Save user message
        ChatMessage userChatMessage = new ChatMessage(userId, sessionId, "user", userMessage, Instant.now());
        chatMessageRepository.save(userChatMessage);
        
        // Get recent messages for context (most recent first, then reverse for chronological order)
        Pageable pageable = PageRequest.of(0, CONTEXT_LIMIT, Sort.by("timestamp").descending());
        List<ChatMessage> recentMessages = chatMessageRepository
            .findBySessionIdAndUserIdOrderByTimestampDesc(sessionId, userId, pageable)
            .getContent()
            .stream()
            .sorted(Comparator.comparing(ChatMessage::getTimestamp))
            .toList();
          // Convert to Gemini format and add background context
        List<GeminiClient.GeminiMessage> contextMessages = recentMessages.stream()
            .map(msg -> new GeminiClient.GeminiMessage(msg.getRole(), msg.getMessage()))
            .collect(ArrayList::new, (list, msg) -> list.add(msg), (list1, list2) -> list1.addAll(list2));
        
        // Add background context as system message at the beginning if available
        backgroundContextService.getCurrentBackgroundContext()
            .ifPresent(backgroundContext -> {
                // Add background context as the first system message
                contextMessages.add(0, new GeminiClient.GeminiMessage("system", 
                    "Background Context: " + backgroundContext + "\n\nPlease respond according to this context and guidelines."));
                log.debug("Added background context to conversation with {} characters", backgroundContext.length());
            });
        
        // Generate AI response
        String aiReply = geminiClient.generateReply(contextMessages);
        
        // Save AI response
        ChatMessage aiChatMessage = new ChatMessage(userId, sessionId, "model", aiReply, Instant.now());
        chatMessageRepository.save(aiChatMessage);
        
        log.debug("Generated response with {} characters for user {} in session {}", 
            aiReply.length(), userId, sessionId);
        
        return aiReply;
    }

    /**
     * Retrieve paginated chat history for a user session.
     * 
     * @param userId The ID of the user
     * @param sessionId The session ID for the conversation
     * @param page Page number (0-based)
     * @param size Number of messages per page
     * @return List of chat message DTOs
     */
    public List<ChatMessageDTO> getHistory(UUID userId, String sessionId, int page, int size) {
        log.debug("Retrieving chat history for user {} in session {}, page {} size {}", 
            userId, sessionId, page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<ChatMessage> messagePage = chatMessageRepository
            .findBySessionIdAndUserIdOrderByTimestampDesc(sessionId, userId, pageable);
        
        List<ChatMessageDTO> result = messagePage.getContent().stream()
            .map(msg -> new ChatMessageDTO(msg.getRole(), msg.getMessage(), msg.getTimestamp()))
            .toList();
        
        log.debug("Retrieved {} messages from history", result.size());
        return result;
    }

    /**
     * Get the total number of messages in a session for a user.
     * 
     * @param userId The ID of the user
     * @param sessionId The session ID for the conversation
     * @return Total number of messages
     */
    public long getMessageCount(UUID userId, String sessionId) {
        return chatMessageRepository.countBySessionIdAndUserId(sessionId, userId);
    }

    /**
     * Get paginated list of sessions for a user, ordered by latest message timestamp.
     * 
     * @param userId The ID of the user
     * @param page Page number (0-based)
     * @param size Number of sessions per page
     * @return List of chat session DTOs
     */
    public List<ChatSessionDTO> getUserSessions(UUID userId, int page, int size) {
        log.debug("Retrieving sessions for user {}, page {} size {}", userId, page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<String> sessionIds = chatMessageRepository.findSessionsByUserIdOrderByLatestMessage(userId, pageable);        List<ChatSessionDTO> sessions = sessionIds.getContent().stream()
            .map(sessionId -> {
                // Use existing methods to get session information
                long messageCount = chatMessageRepository.countBySessionIdAndUserId(sessionId, userId);
                
                // Get the most recent message for timestamp and content
                Pageable singlePage = PageRequest.of(0, 1, Sort.by("timestamp").descending());
                Page<ChatMessage> lastMessagePage = chatMessageRepository
                    .findBySessionIdAndUserIdOrderByTimestampDesc(sessionId, userId, singlePage);
                
                Instant lastTimestamp = null;
                String lastMessage = null;
                
                if (!lastMessagePage.isEmpty()) {
                    ChatMessage lastMsg = lastMessagePage.getContent().get(0);
                    lastTimestamp = lastMsg.getTimestamp();
                    lastMessage = lastMsg.getMessage();
                }
                
                // Truncate last message if too long
                String truncatedMessage = lastMessage != null && lastMessage.length() > 100 
                    ? lastMessage.substring(0, 100) + "..." 
                    : lastMessage;
                
                return new ChatSessionDTO(
                    sessionId,
                    lastTimestamp,
                    messageCount,
                    truncatedMessage
                );
            })
            .toList();
        
        log.debug("Retrieved {} sessions for user {}", sessions.size(), userId);
        return sessions;
    }

    /**
     * Get the total number of sessions for a user.
     * 
     * @param userId The ID of the user
     * @return Total number of sessions
     */
    public long getUserSessionCount(UUID userId) {
        return chatMessageRepository.findSessionsByUserIdOrderByLatestMessage(userId, Pageable.unpaged())
            .getTotalElements();
    }
}
