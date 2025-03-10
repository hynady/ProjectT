package com.ticket.servermono.authcontext.adapters.controllers;

import com.ticket.servermono.authcontext.adapters.dtos.*;
import com.ticket.servermono.authcontext.usecases.ProfileServices;

import lombok.RequiredArgsConstructor;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("v1/user")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileServices profileServices;

    @GetMapping("/profiles")
    public ResponseEntity<List<ProfileDTO>> getProfilesByEndUserId(@Nullable Principal principal) {
        // Kiểm tra xem có người dùng đăng nhập không
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        // Lấy userId từ principal name
        String userId = principal.getName();

        try {
            List<ProfileDTO> profiles = profileServices.getProfilesByEndUserId(userId);
            return ResponseEntity.ok(profiles);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    @PostMapping("/profiles")
    public ResponseEntity<ProfileCardResponse> createProfile(
            @RequestBody CreateProfileRequest request,
            @Nullable Principal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            ProfileCardResponse response = profileServices.createProfile(principal.getName(), request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ProfileCardResponse errorResponse = new ProfileCardResponse(false, e.getMessage(), null);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @PutMapping("/profiles/{id}")
    public ResponseEntity<ProfileCardResponse> updateProfile(
            @PathVariable("id") UUID profileId,
            @RequestBody UpdateProfileCardRequest request,
            @Nullable Principal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            request.setId(profileId); // Ensure ID in path matches ID in request
            ProfileCardResponse response = profileServices.updateProfile(profileId, request, principal.getName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ProfileCardResponse errorResponse = new ProfileCardResponse(false, e.getMessage(), null);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @DeleteMapping("/profiles/{id}")
    public ResponseEntity<GenericResponse> deleteProfile(
            @PathVariable("id") UUID profileId,
            @Nullable Principal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            GenericResponse response = profileServices.deleteProfile(profileId, principal.getName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            GenericResponse errorResponse = new GenericResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @DeleteMapping("/account")
    public ResponseEntity<GenericResponse> deleteAccount(
            @RequestBody DeleteAccountRequest request,
            @Nullable Principal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            UUID userId = UUID.fromString(principal.getName());
            // Force userId to match authenticated user for security
            request.setUserId(userId);
            GenericResponse response = profileServices.deleteAccount(userId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            GenericResponse errorResponse = new GenericResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
