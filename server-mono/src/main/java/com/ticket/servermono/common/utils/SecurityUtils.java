package com.ticket.servermono.common.utils;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.ticket.servermono.authcontext.infrastructure.config.AuthDataInitializer;

/**
 * Utility class to get current user information from Security Context
 */
public class SecurityUtils {
    
    /**
     * Get the current authenticated user's ID, or the system user ID if no user is authenticated
     * 
     * @return UUID of current user or system user UUID if not authenticated
     */
    public static UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null) {
            try {
                return UUID.fromString(authentication.getName());
            } catch (IllegalArgumentException e) {
                // Fallback to system user
                UUID systemId = AuthDataInitializer.getSystemUserId();
                return systemId != null ? systemId : UUID.randomUUID();
            }
        }
        
        // Fallback to system user
        UUID systemId = AuthDataInitializer.getSystemUserId();
        return systemId != null ? systemId : UUID.randomUUID();
    }
}
