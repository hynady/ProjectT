package com.ticket.servermono.ticketcontext.usecases;

import com.ticket.servermono.ticketcontext.adapters.dtos.ShowAuthCodeResponse;
import com.ticket.servermono.ticketcontext.entities.ShowAuthCode;
import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.ShowAuthCodeRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShowAuthCodeServices {

    private final ShowAuthCodeRepository showAuthCodeRepository;
    private final TicketClassRepository ticketClassRepository;
    
    // Characters used for generating random auth codes
    private static final String AUTH_CODE_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int AUTH_CODE_LENGTH = 6;
    private static final SecureRandom random = new SecureRandom();

    /**
     * Get the auth code for a show, creating it if it doesn't exist
     * @param showId The ID of the show
     * @param userId The ID of the user requesting the code
     * @return The auth code response
     */
    @Transactional
    public ShowAuthCodeResponse getAuthCode(UUID showId, UUID userId) {
        log.info("Getting auth code for show {} requested by user {}", showId, userId);
        
        // Check if the user is authorized to view this code by checking if they created any ticket class for this show
        boolean isAuthorized = checkUserAuthorization(userId, showId);
        
        if (!isAuthorized) {
            throw new SecurityException("User is not authorized to access this show's auth code");
        }
        
        // Get or create auth code
        ShowAuthCode authCode = getOrCreateAuthCode(showId);
        
        return buildResponse(authCode);
    }
    
    /**
     * Manually refresh the auth code for a show
     * @param showId The ID of the show
     * @param userId The ID of the user requesting the refresh
     * @return The refreshed auth code response
     */
    @Transactional
    public ShowAuthCodeResponse refreshAuthCode(UUID showId, UUID userId) {
        log.info("Refreshing auth code for show {} requested by user {}", showId, userId);
        
        // Check if the user is authorized to refresh this code
        boolean isAuthorized = checkUserAuthorization(userId, showId);
        
        if (!isAuthorized) {
            throw new SecurityException("User is not authorized to refresh this show's auth code");
        }
        
        // Get existing auth code or create a new one
        ShowAuthCode authCode = getOrCreateAuthCode(showId);
        
        // Generate a new auth code and update timestamps
        refreshCode(authCode);
        showAuthCodeRepository.save(authCode);
        
        return buildResponse(authCode);
    }
    
    /**
     * Check if a user is authorized to access a show's auth code
     * The user must have created at least one ticket class for the show
     * @param userId The ID of the user
     * @param showId The ID of the show
     * @return true if authorized, false otherwise
     */
    private boolean checkUserAuthorization(UUID userId, UUID showId) {
        List<TicketClass> ticketClasses = ticketClassRepository.findByShowId(showId);
        
        if (ticketClasses.isEmpty()) {
            log.warn("No ticket classes found for show {}", showId);
            throw new EntityNotFoundException("No ticket classes found for show: " + showId);
        }
        
        // Check if any ticket class was created by this user
        return ticketClasses.stream()
                .anyMatch(tc -> userId.equals(tc.getCreatedBy()));
    }
    
    /**
     * Get an existing auth code or create a new one if it doesn't exist
     * @param showId The ID of the show
     * @return The auth code
     */
    @Transactional
    public ShowAuthCode getOrCreateAuthCode(UUID showId) {
        Optional<ShowAuthCode> existingAuthCode = showAuthCodeRepository.findByShowId(showId);
        
        if (existingAuthCode.isPresent()) {
            ShowAuthCode authCode = existingAuthCode.get();
            
            // Check if code is expired and needs refreshing
            if (authCode.getExpiresAt().isBefore(LocalDateTime.now())) {
                refreshCode(authCode);
                showAuthCodeRepository.save(authCode);
            }
            
            return authCode;
        } else {
            // Create new auth code
            ShowAuthCode newAuthCode = ShowAuthCode.builder()
                    .showId(showId)
                    .authCode(generateRandomCode())
                    .lastRefreshed(LocalDateTime.now())
                    .expiresAt(LocalDateTime.now().plusHours(1))
                    .build();
            
            return showAuthCodeRepository.save(newAuthCode);
        }
    }
    
    /**
     * Refresh an auth code with a new random code and updated timestamps
     * @param authCode The auth code to refresh
     */
    private void refreshCode(ShowAuthCode authCode) {
        authCode.setAuthCode(generateRandomCode());
        authCode.setLastRefreshed(LocalDateTime.now());
        authCode.setExpiresAt(LocalDateTime.now().plusHours(1));
    }
    
    /**
     * Generate a random auth code
     * @return The generated auth code
     */
    private String generateRandomCode() {
        StringBuilder sb = new StringBuilder(AUTH_CODE_LENGTH);
        for (int i = 0; i < AUTH_CODE_LENGTH; i++) {
            sb.append(AUTH_CODE_CHARS.charAt(random.nextInt(AUTH_CODE_CHARS.length())));
        }
        return sb.toString();
    }
    
    /**
     * Build a response DTO from an auth code entity
     * @param authCode The auth code entity
     * @return The auth code response DTO
     */
    private ShowAuthCodeResponse buildResponse(ShowAuthCode authCode) {
        return new ShowAuthCodeResponse(
                authCode.getAuthCode(),
                authCode.getExpiresAt()
        );
    }
    
    /**
     * Scheduled task to refresh all expired auth codes
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    @Transactional
    public void refreshExpiredAuthCodes() {
        log.info("Running scheduled task to refresh expired auth codes");
        
        List<ShowAuthCode> expiredCodes = showAuthCodeRepository.findByExpiresAtBefore(LocalDateTime.now());
        
        for (ShowAuthCode code : expiredCodes) {
            refreshCode(code);
        }
        
        if (!expiredCodes.isEmpty()) {
            showAuthCodeRepository.saveAll(expiredCodes);
            log.info("Refreshed {} expired auth codes", expiredCodes.size());
        }
    }
    
    /**
     * Scheduled task to clean up auth codes for shows that no longer have ticket classes
     * Runs daily
     */
    @Scheduled(fixedRate = 86400000) // 24 hours in milliseconds
    @Transactional
    public void cleanupOrphanedAuthCodes() {
        log.info("Running scheduled task to clean up orphaned auth codes");
        
        List<ShowAuthCode> orphanedCodes = showAuthCodeRepository.findAllWithoutTicketClass();
        
        if (!orphanedCodes.isEmpty()) {
            showAuthCodeRepository.deleteAll(orphanedCodes);
            log.info("Deleted {} orphaned auth codes", orphanedCodes.size());
        }
    }
    
    /**
     * Validates if the provided authentication code is valid for a specific show
     * @param code The authentication code to validate
     * @param showId The ID of the show
     * @return true if the code is valid and not expired, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean validateAuthCodeForShow(String code, UUID showId) {
        log.info("Validating auth code for show {}", showId);
        
        if (code == null || code.isEmpty() || showId == null) {
            log.warn("Invalid parameters for validation: code={}, showId={}", code, showId);
            return false;
        }
        
        Optional<ShowAuthCode> authCodeOpt = showAuthCodeRepository.findByShowId(showId);
        
        if (authCodeOpt.isEmpty()) {
            log.warn("No auth code found for show {}", showId);
            return false;
        }
        
        ShowAuthCode authCode = authCodeOpt.get();
        
        // Check if code matches and is not expired
        boolean isValid = code.equals(authCode.getAuthCode()) && 
                         !authCode.getExpiresAt().isBefore(LocalDateTime.now());
        
        log.info("Auth code for show {} is {}", showId, isValid ? "valid" : "invalid");
        
        return isValid;
    }
    
    /**
     * Validates if the provided authentication code exists and is still valid
     * @param code The authentication code to validate
     * @return Optional containing the auth code entity if valid, empty otherwise
     */
    @Transactional(readOnly = true)
    public Optional<ShowAuthCode> validateAuthCode(String code) {
        log.info("Validating auth code: {}", code);
        
        if (code == null || code.isEmpty()) {
            log.warn("Invalid auth code: empty or null");
            return Optional.empty();
        }
        
        Optional<ShowAuthCode> authCodeOpt = showAuthCodeRepository.findByAuthCode(code);
        
        if (authCodeOpt.isEmpty()) {
            log.warn("Auth code not found: {}", code);
            return Optional.empty();
        }
        
        ShowAuthCode authCode = authCodeOpt.get();
        
        // Check if the code is expired
        if (authCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Auth code is expired: {}", code);
            return Optional.empty();
        }
        
        return authCodeOpt;
    }
}
