package com.ticket.servermono.occacontext.adapters.controllers;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.occacontext.adapters.dtos.ShowAuthCodeResponse;
import com.ticket.servermono.occacontext.entities.Show;
import com.ticket.servermono.occacontext.infrastructure.repositories.ShowRepository;

import occa.ShowAuthCodeRequest;
import occa.ShowAuthCodeGrpcResponse;
import occa.ShowAuthCodeServiceGrpc.ShowAuthCodeServiceBlockingStub;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1")
public class OccaAuthController {

    private final ShowRepository showRepository;
      @GrpcClient("ticket-service")
    private ShowAuthCodeServiceBlockingStub showAuthCodeServiceStub;

    /**
     * Get the auth code for a show with authorization check
     * @param showId The ID of the show
     * @param principal The authenticated user
     * @return The auth code response
     */
    @GetMapping("/shows/{showId}/auth-code")
    public ResponseEntity<?> getAuthCode(@PathVariable UUID showId, Principal principal) {
        log.info("Getting auth code for show {} requested by user {}", showId, principal.getName());
        
        try {
            // Check if principal is null or name is null/empty
            if (principal == null || principal.getName() == null || principal.getName().isEmpty()) {
                return ResponseEntity.status(401).body("Unauthorized: No valid authentication provided");
            }
            
            UUID userId = UUID.fromString(principal.getName());
            
            // Check if the user is authorized to view this code
            boolean isAuthorized = checkUserAuthorization(userId, showId);
            
            if (!isAuthorized) {
                return ResponseEntity.status(403).body("User is not authorized to access this show's auth code");
            }            // Get auth code using gRPC call
            ShowAuthCodeRequest request = ShowAuthCodeRequest.newBuilder()
                    .setShowId(showId.toString())
                    .build();
            
            ShowAuthCodeGrpcResponse grpcResponse = showAuthCodeServiceStub.getAuthCode(request);
            
            // Convert gRPC response to DTO
            ShowAuthCodeResponse response = new ShowAuthCodeResponse(
                grpcResponse.getAuthCode(),
                LocalDateTime.parse(grpcResponse.getExpiresAt())
            );
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format: {}", principal.getName(), e);
            return ResponseEntity.status(400).body("Invalid user ID format");
        } catch (EntityNotFoundException e) {
            log.error("Entity not found: {}", e.getMessage(), e);
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error getting auth code for show {}: {}", showId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Internal server error");
        }
    }
    
    /**
     * Manually refresh the auth code for a show with authorization check
     * @param showId The ID of the show
     * @param principal The authenticated user
     * @return The refreshed auth code response
     */
    @PostMapping("/shows/{showId}/auth-code/refresh")
    public ResponseEntity<?> refreshAuthCode(@PathVariable UUID showId, Principal principal) {
        log.info("Refreshing auth code for show {} requested by user {}", showId, principal.getName());
        
        try {
            UUID userId = UUID.fromString(principal.getName());
            
            // Check if the user is authorized to refresh this code
            boolean isAuthorized = checkUserAuthorization(userId, showId);
            
            if (!isAuthorized) {
                return ResponseEntity.status(403).body("User is not authorized to refresh this show's auth code");
            }
              // Refresh auth code using gRPC call
            ShowAuthCodeRequest request = ShowAuthCodeRequest.newBuilder()
                    .setShowId(showId.toString())
                    .build();
            
            ShowAuthCodeGrpcResponse grpcResponse = showAuthCodeServiceStub.refreshAuthCode(request);
            
            // Convert gRPC response to DTO
            ShowAuthCodeResponse response = new ShowAuthCodeResponse(
                grpcResponse.getAuthCode(),
                LocalDateTime.parse(grpcResponse.getExpiresAt())
            );
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format: {}", principal.getName(), e);
            return ResponseEntity.status(400).body("Invalid user ID format");
        } catch (EntityNotFoundException e) {
            log.error("Entity not found: {}", e.getMessage(), e);
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error refreshing auth code for show {}: {}", showId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Internal server error");
        }
    }
    
    /**
     * Check if a user is authorized to access a show's auth code
     * The user must be the creator of the show
     * @param userId The ID of the user
     * @param showId The ID of the show
     * @return true if authorized, false otherwise
     */
    private boolean checkUserAuthorization(UUID userId, UUID showId) {
        Optional<Show> showOpt = showRepository.findById(showId);
        
        if (showOpt.isEmpty()) {
            log.warn("Show not found: {}", showId);
            throw new EntityNotFoundException("Show not found: " + showId);
        }
        
        Show show = showOpt.get();
        
        // Check if the user is the creator of the show
        return userId.equals(show.getCreatedBy());
    }
}
