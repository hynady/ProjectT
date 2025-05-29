package com.ticket.servermono.ticketcontext.adapters.controllers;

import com.ticket.servermono.ticketcontext.entities.ShowAuthCode;
import com.ticket.servermono.ticketcontext.usecases.ShowAuthCodeServices;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/shows")
public class ShowAuthCodeController {

    private final ShowAuthCodeServices showAuthCodeServices;
    
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
