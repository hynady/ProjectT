package com.ticket.servermono.ticketcontext.adapters.controllers;

import com.ticket.servermono.ticketcontext.adapters.dtos.ShowAuthCodeResponse;
import com.ticket.servermono.ticketcontext.entities.ShowAuthCode;
import com.ticket.servermono.ticketcontext.usecases.ShowAuthCodeServices;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/shows")
public class ShowAuthCodeController {

    private final ShowAuthCodeServices showAuthCodeServices;

    /**
     * Get the authentication code for a show
     * Principal must be the creator of at least one ticket class for the show
     * Endpoint: GET /shows/{showId}/auth-code
     */
    @GetMapping("/{showId}/auth-code")
    public ResponseEntity<?> getAuthCode(
            @PathVariable String showId,
            @Nullable Principal principal) {
        
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("Authentication required for getting auth code");
        }
        
        try {
            ShowAuthCodeResponse response = showAuthCodeServices.getAuthCode(
                    UUID.fromString(showId),
                    UUID.fromString(principal.getName())
            );
            
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            log.warn("Unauthorized access attempt to auth code for show {}: {}", showId, e.getMessage());
            return ResponseEntity.status(403).body("You are not authorized to access this show's auth code");
        } catch (EntityNotFoundException e) {
            log.warn("Auth code access for non-existent show {}: {}", showId, e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error getting auth code for show {}: {}", showId, e.getMessage(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Manually refresh the authentication code for a show
     * Principal must be the creator of at least one ticket class for the show
     * Endpoint: POST /shows/{showId}/refresh-auth-code
     */
    @PostMapping("/{showId}/refresh-auth-code")
    public ResponseEntity<?> refreshAuthCode(
            @PathVariable String showId,
            @Nullable Principal principal) {
        
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).body("Authentication required for refreshing auth code");
        }
        
        try {
            ShowAuthCodeResponse response = showAuthCodeServices.refreshAuthCode(
                    UUID.fromString(showId),
                    UUID.fromString(principal.getName())
            );
            
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            log.warn("Unauthorized refresh attempt for auth code of show {}: {}", showId, e.getMessage());
            return ResponseEntity.status(403).body("You are not authorized to refresh this show's auth code");
        } catch (EntityNotFoundException e) {
            log.warn("Auth code refresh for non-existent show {}: {}", showId, e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error refreshing auth code for show {}: {}", showId, e.getMessage(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Validate if an authentication code exists and is still valid
     * No show ID required, just the code
     * Returns 200 with expiration time if valid, 404 otherwise
     * Endpoint: GET /shows/validate-auth-code?code=YOUR_CODE
     */
    @GetMapping("/validate-auth-code")
    public ResponseEntity<?> validateAuthCodeOnly(@RequestParam String code) {
        try {
            Optional<ShowAuthCode> authCodeOpt = showAuthCodeServices.validateAuthCode(code);
            
            if (authCodeOpt.isPresent()) {
                ShowAuthCode authCode = authCodeOpt.get();
                return ResponseEntity.ok(Map.of(
                    "exists", true, 
                    "expiresAt", authCode.getExpiresAt()
                ));
            } else {
                return ResponseEntity.status(404).body("Invalid or expired auth code");
            }
        } catch (Exception e) {
            log.error("Error validating auth code '{}': {}", code, e.getMessage(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
