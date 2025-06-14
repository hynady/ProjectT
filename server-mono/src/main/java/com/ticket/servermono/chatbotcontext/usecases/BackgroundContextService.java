package com.ticket.servermono.chatbotcontext.usecases;

import com.ticket.servermono.chatbotcontext.adapters.dtos.BackgroundContextDTO;
import com.ticket.servermono.chatbotcontext.entities.BackgroundContext;
import com.ticket.servermono.chatbotcontext.repositories.BackgroundContextRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing chatbot background context.
 * Provides CRUD operations and context retrieval functionality.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BackgroundContextService {
    
    private final BackgroundContextRepository backgroundContextRepository;
      /**
     * Get the current active background context for the chatbot.
     * Returns the most recently updated active context.
     */
    public Optional<String> getCurrentBackgroundContext() {
        return backgroundContextRepository.findMostRecentActiveContext()
            .map(BackgroundContext::getContent);
    }
    
    /**
     * Get the current active background context DTO for admin UI.
     * Returns null if no context is active.
     */
    public Optional<BackgroundContextDTO> getCurrentActiveContext() {
        return backgroundContextRepository.findMostRecentActiveContext()
            .map(this::toDTO);
    }
      /**
     * Get all background contexts with pagination.
     * Ordered by active status first (active contexts appear first), then by updated time.
     */
    public List<BackgroundContextDTO> getAllContexts(int page, int size) {
        log.debug("Retrieving background contexts, page {} size {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<BackgroundContext> contextPage = backgroundContextRepository.findAllOrderByActiveFirstThenUpdatedAt(pageable);
        
        return contextPage.getContent().stream()
            .map(this::toDTO)
            .toList();
    }
    
    /**
     * Get a specific background context by ID.
     */
    public Optional<BackgroundContextDTO> getContextById(Long id) {
        log.debug("Retrieving background context with id {}", id);
        
        return backgroundContextRepository.findById(id)
            .map(this::toDTO);
    }
      /**
     * Create a new background context.
     * If the new context is active, deactivate all other contexts.
     */
    @Transactional
    public BackgroundContextDTO createContext(BackgroundContextDTO contextDTO) {
        log.debug("Creating new background context with title: {}", contextDTO.title());
        
        BackgroundContext context = new BackgroundContext(
            contextDTO.title(),
            contextDTO.content()
        );
        
        boolean shouldBeActive = contextDTO.isActive() == null || contextDTO.isActive();
        context.setIsActive(shouldBeActive);
        
        // If this context should be active, deactivate all others first
        if (shouldBeActive) {
            int deactivatedCount = backgroundContextRepository.deactivateAll();
            log.debug("Deactivated {} existing contexts before creating new active context", deactivatedCount);
        }
        
        BackgroundContext savedContext = backgroundContextRepository.save(context);
        log.info("Created background context with id {}, active: {}", savedContext.getId(), savedContext.getIsActive());
        
        return toDTO(savedContext);
    }
      /**
     * Update an existing background context.
     * If the context is being activated, deactivate all other contexts.
     */
    @Transactional
    public Optional<BackgroundContextDTO> updateContext(Long id, BackgroundContextDTO contextDTO) {
        log.debug("Updating background context with id {}", id);
        
        return backgroundContextRepository.findById(id)
            .map(existingContext -> {
                existingContext.setTitle(contextDTO.title());
                existingContext.setContent(contextDTO.content());
                
                boolean shouldBeActive = contextDTO.isActive() != null ? contextDTO.isActive() : existingContext.getIsActive();
                
                // If this context should be active and wasn't before, deactivate all others
                if (shouldBeActive && !existingContext.getIsActive()) {
                    int deactivatedCount = backgroundContextRepository.deactivateAllExcept(id);
                    log.debug("Deactivated {} other contexts when activating context {}", deactivatedCount, id);
                }
                
                existingContext.setIsActive(shouldBeActive);
                
                BackgroundContext updatedContext = backgroundContextRepository.save(existingContext);
                log.info("Updated background context with id {}, active: {}", updatedContext.getId(), updatedContext.getIsActive());
                
                return toDTO(updatedContext);
            });
    }
    
    /**
     * Delete a background context (soft delete by setting isActive to false).
     */
    @Transactional
    public boolean deleteContext(Long id) {
        log.debug("Deleting background context with id {}", id);
        
        return backgroundContextRepository.findById(id)
            .map(context -> {
                context.setIsActive(false);
                backgroundContextRepository.save(context);
                log.info("Soft deleted background context with id {}", id);
                return true;
            })
            .orElse(false);
    }
      /**
     * Toggle active status of a background context.
     * If activating, deactivate all other contexts to ensure only one is active.
     */
    @Transactional
    public Optional<BackgroundContextDTO> toggleActiveStatus(Long id) {
        log.debug("Toggling active status for background context with id {}", id);
        
        return backgroundContextRepository.findById(id)
            .map(context -> {
                boolean newActiveStatus = !context.getIsActive();
                
                // If activating this context, deactivate all others first
                if (newActiveStatus) {
                    int deactivatedCount = backgroundContextRepository.deactivateAllExcept(id);
                    log.debug("Deactivated {} other contexts when activating context {}", deactivatedCount, id);
                }
                
                context.setIsActive(newActiveStatus);
                BackgroundContext updatedContext = backgroundContextRepository.save(context);
                log.info("Toggled active status for background context with id {} to {}", 
                    id, updatedContext.getIsActive());
                
                return toDTO(updatedContext);
            });
    }
    
    /**
     * Get count of all contexts.
     */
    public long getTotalCount() {
        return backgroundContextRepository.count();
    }
    
    /**
     * Get count of active contexts.
     */
    public long getActiveCount() {
        return backgroundContextRepository.countByIsActiveTrue();
    }
    
    /**
     * Convert entity to DTO.
     */
    private BackgroundContextDTO toDTO(BackgroundContext context) {
        return new BackgroundContextDTO(
            context.getId(),
            context.getTitle(),
            context.getContent(),
            context.getIsActive(),
            context.getCreatedAt(),
            context.getUpdatedAt()
        );
    }
}
