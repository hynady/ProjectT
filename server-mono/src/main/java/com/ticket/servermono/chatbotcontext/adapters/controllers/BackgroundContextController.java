package com.ticket.servermono.chatbotcontext.adapters.controllers;

import com.ticket.servermono.chatbotcontext.adapters.dtos.BackgroundContextDTO;
import com.ticket.servermono.chatbotcontext.usecases.BackgroundContextService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for managing chatbot background context.
 * Provides endpoints for CRUD operations on background context.
 */
@RestController
@RequestMapping("/v1/chat/background-context")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("isAuthenticated()")
@Validated
public class BackgroundContextController {

    private final BackgroundContextService backgroundContextService;

    /**
     * Get all background contexts with pagination.
     * 
     * @param page Page number (0-based, default: 0)
     * @param size Number of contexts per page (default: 10, max: 50)
     * @return List of BackgroundContextDTO objects
     */
    @GetMapping
    public ResponseEntity<List<BackgroundContextDTO>> getAllContexts(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size) {
        
        try {
            log.debug("Retrieving background contexts, page {} size {}", page, size);
            
            List<BackgroundContextDTO> contexts = backgroundContextService.getAllContexts(page, size);
            
            return ResponseEntity.ok(contexts);
            
        } catch (Exception e) {
            log.error("Error retrieving background contexts", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get a specific background context by ID.
     * 
     * @param id The context ID
     * @return BackgroundContextDTO object
     */
    @GetMapping("/{id}")
    public ResponseEntity<BackgroundContextDTO> getContextById(@PathVariable Long id) {
        
        try {
            log.debug("Retrieving background context with id {}", id);
            
            return backgroundContextService.getContextById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            log.error("Error retrieving background context with id {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Create a new background context.
     * Only admin users can create contexts.
     * 
     * @param contextDTO The context data
     * @return Created BackgroundContextDTO object
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BackgroundContextDTO> createContext(
            @Valid @RequestBody BackgroundContextDTO contextDTO) {
        
        try {
            log.debug("Creating new background context with title: {}", contextDTO.title());
            
            BackgroundContextDTO createdContext = backgroundContextService.createContext(contextDTO);
            
            return ResponseEntity.ok(createdContext);
            
        } catch (Exception e) {
            log.error("Error creating background context", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update an existing background context.
     * Only admin users can update contexts.
     * 
     * @param id The context ID
     * @param contextDTO The updated context data
     * @return Updated BackgroundContextDTO object
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BackgroundContextDTO> updateContext(
            @PathVariable Long id,
            @Valid @RequestBody BackgroundContextDTO contextDTO) {
        
        try {
            log.debug("Updating background context with id {}", id);
            
            return backgroundContextService.updateContext(id, contextDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            log.error("Error updating background context with id {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Delete a background context (soft delete).
     * Only admin users can delete contexts.
     * 
     * @param id The context ID
     * @return Success response
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteContext(@PathVariable Long id) {
        
        try {
            log.debug("Deleting background context with id {}", id);
            
            boolean deleted = backgroundContextService.deleteContext(id);
            
            return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            log.error("Error deleting background context with id {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Toggle active status of a background context.
     * Only admin users can toggle status.
     * 
     * @param id The context ID
     * @return Updated BackgroundContextDTO object
     */
    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BackgroundContextDTO> toggleActiveStatus(@PathVariable Long id) {
        
        try {
            log.debug("Toggling active status for background context with id {}", id);
            
            return backgroundContextService.toggleActiveStatus(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            log.error("Error toggling active status for background context with id {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }    /**
     * Get statistics about background contexts.
     * 
     * @return Statistics map
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getContextStats() {
        
        try {
            log.debug("Retrieving background context statistics");
            
            Map<String, Long> stats = Map.of(
                "total", backgroundContextService.getTotalCount(),
                "active", backgroundContextService.getActiveCount()
            );
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("Error retrieving background context statistics", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get the currently active background context.
     * Returns the context that is currently being used by the chatbot.
     * 
     * @return Currently active BackgroundContextDTO object, or 404 if none is active
     */
    @GetMapping("/current")
    public ResponseEntity<BackgroundContextDTO> getCurrentActiveContext() {
        
        try {
            log.debug("Retrieving currently active background context");
            
            return backgroundContextService.getCurrentActiveContext()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            log.error("Error retrieving current active background context", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
