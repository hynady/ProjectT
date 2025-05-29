package com.ticket.servermono.ticketcontext.usecases;

import com.ticket.servermono.ticketcontext.adapters.dtos.ShowAuthCodeResponse;
import com.ticket.servermono.ticketcontext.entities.ShowAuthCode;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.ShowAuthCodeRepository;
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
    
    // Characters used for generating random auth codes
    private static final String AUTH_CODE_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int AUTH_CODE_LENGTH = 6;
    private static final SecureRandom random = new SecureRandom();
    
    /**
     * Get the auth code for a show directly, without authorization checks
     * This method is intended to be called from gRPC after authorization is verified
     * @param showId The ID of the show
     * @return The auth code response
     */
    @Transactional
    public ShowAuthCodeResponse getAuthCodeDirect(UUID showId) {
        log.info("Getting auth code directly for show {}", showId);
        
        // Get or create auth code without authorization check
        ShowAuthCode authCode = getOrCreateAuthCode(showId);
        
        return buildResponse(authCode);
    }
    
    /**
     * Refresh the auth code for a show directly, without authorization checks
     * This method is intended to be called from gRPC after authorization is verified
     * @param showId The ID of the show
     * @return The refreshed auth code response
     */
    @Transactional
    public ShowAuthCodeResponse refreshAuthCodeDirect(UUID showId) {
        log.info("Refreshing auth code directly for show {}", showId);
        
        // Get existing auth code or create a new one
        ShowAuthCode authCode = getOrCreateAuthCode(showId);
        
        // Generate a new auth code and update timestamps
        refreshCode(authCode);
        showAuthCodeRepository.save(authCode);
        
        return buildResponse(authCode);
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
