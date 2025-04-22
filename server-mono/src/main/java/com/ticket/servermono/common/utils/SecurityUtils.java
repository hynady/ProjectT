package com.ticket.servermono.common.utils;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility class to get current user information from Security Context
 */
public class SecurityUtils {
    
    private static final UUID DEFAULT_USER_ID = UUID.fromString("79bd5e8c-c44a-4a9e-a975-35bba7159435");
    
    /**
     * Get the current authenticated user's ID, or a default UUID if no user is authenticated
     * 
     * @return UUID of current user or default UUID if not authenticated
     */
    public static UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null) {
            try {
                return UUID.fromString(authentication.getName());
            } catch (IllegalArgumentException e) {
                return DEFAULT_USER_ID;
            }
        }
        
        return DEFAULT_USER_ID;
    }
}
