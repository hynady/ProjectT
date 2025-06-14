package com.ticket.servermono.chatbotcontext.adapters.clients;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Client for interacting with Google Gemini AI model using WebClient and Guava collections.
 * Handles content generation using the Gemini Pro model.
 */
@Component
@Slf4j
public class GeminiClient {
    
    private final WebClient webClient;
    private final String apiKey;
    private final Gson gson;
    private static final String GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
    private static final String MODEL_NAME = "gemma-3n-e4b-it";
    private static final Duration TIMEOUT = Duration.ofSeconds(30);
    
    public GeminiClient(@Value("${app.geminiApiKey}") String apiKey) {
        this.apiKey = apiKey;
        this.gson = new Gson();
        this.webClient = WebClient.builder()
            .baseUrl(GEMINI_API_BASE_URL)
            .defaultHeader("Content-Type", "application/json")
            .build();
        
        log.info("GeminiClient initialized with WebClient and Guava collections");
    }

    /**
     * Generate a reply based on conversation context using Guava collections.
     * 
     * @param contextMessages List of conversation messages for context
     * @return Generated reply text
     */
    public String generateReply(List<GeminiMessage> contextMessages) {
        try {
            log.debug("Generating reply with {} context messages", contextMessages.size());
            
            // Build request using Guava ImmutableList and ImmutableMap
            ImmutableList<Map<String, Object>> contents = contextMessages.stream()
                .map(msg -> ImmutableMap.<String, Object>builder()
                    .put("role", msg.getRole().equals("model") ? "model" : "user")
                    .put("parts", ImmutableList.of(
                        ImmutableMap.of("text", msg.getMessage())
                    ))
                    .build())
                .collect(ImmutableList.toImmutableList());
            
            Map<String, Object> generationConfig = ImmutableMap.<String, Object>builder()
                .put("temperature", 0.9f)
                .put("topK", 1)
                .put("topP", 1.0f)
                .put("maxOutputTokens", 2048)
                .build();
            
            Map<String, Object> requestBody = ImmutableMap.<String, Object>builder()
                .put("contents", contents)
                .put("generationConfig", generationConfig)
                .build();
            
            // Make API call using WebClient
            String response = webClient
                .post()
                .uri(uriBuilder -> uriBuilder
                    .path(MODEL_NAME + ":generateContent")
                    .queryParam("key", apiKey)
                    .build())
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(TIMEOUT)
                .block();
            
            // Parse response using Gson
            JsonObject jsonResponse = gson.fromJson(response, JsonObject.class);
            if (jsonResponse.has("candidates")) {
                JsonArray candidates = jsonResponse.getAsJsonArray("candidates");
                if (candidates.size() > 0) {
                    JsonObject candidate = candidates.get(0).getAsJsonObject();
                    if (candidate.has("content")) {
                        JsonObject content = candidate.getAsJsonObject("content");
                        if (content.has("parts")) {
                            JsonArray parts = content.getAsJsonArray("parts");
                            if (parts.size() > 0) {
                                JsonObject part = parts.get(0).getAsJsonObject();
                                if (part.has("text")) {
                                    String reply = part.get("text").getAsString();
                                    log.debug("Generated reply with {} characters", reply.length());
                                    return reply.trim();
                                }
                            }
                        }
                    }
                }
            }
            
            log.warn("No valid response from Gemini API");
            return "I apologize, but I couldn't generate a response at this time.";
            
        } catch (WebClientResponseException e) {
            log.error("HTTP error from Gemini API: {} - {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            return "I apologize, but I'm experiencing technical difficulties. Please try again later.";
        } catch (Exception e) {
            log.error("Error generating content from Gemini", e);
            return "I apologize, but an unexpected error occurred. Please try again later.";
        }
    }
    
    /**
     * Simple message class for internal use.
     */
    @Data
    public static class GeminiMessage {
        private String role;
        private String message;
        
        public GeminiMessage(String role, String message) {
            this.role = role;
            this.message = message;
        }
    }
}
