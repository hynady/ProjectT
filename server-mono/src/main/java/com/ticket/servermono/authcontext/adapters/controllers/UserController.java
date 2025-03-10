package com.ticket.servermono.authcontext.adapters.controllers;

import com.ticket.servermono.authcontext.adapters.dtos.UpdateProfileRequest;
import com.ticket.servermono.authcontext.adapters.dtos.UpdateProfileResponse;
import com.ticket.servermono.authcontext.adapters.dtos.UserInfoDTO;
import com.ticket.servermono.authcontext.usecases.EndUserServices;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import java.security.Principal;
import java.util.UUID;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("v1/user")
@RequiredArgsConstructor
public class UserController {
    
    private final EndUserServices endUserServices;
    
    @GetMapping()
    public ResponseEntity<UserInfoDTO> getUserInfo(@Nullable Principal principal) {
        // Kiểm tra xem có người dùng đăng nhập không
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        // Lấy userId từ principal name
        String userId = principal.getName();
        
        try {
            UUID userUuid = UUID.fromString(userId);
            UserInfoDTO userInfo = endUserServices.getUserInfo(userUuid);
            return ResponseEntity.ok(userInfo);
        } catch (IllegalArgumentException e) {
            // Xử lý trường hợp userId không phải là UUID hợp lệ
            return ResponseEntity.status(401).build();
        }
    }

    public ResponseEntity<String> getAvatar(@Nullable Principal principal) {
        // Kiểm tra xem có người dùng đăng nhập không
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        // Lấy userId từ principal name
        String userId = principal.getName();
        
        try {
            UUID userUuid = UUID.fromString(userId);
            String avatar = endUserServices.getAvatar(userUuid);
            return ResponseEntity.ok(avatar);
        } catch (IllegalArgumentException e) {
            // Xử lý trường hợp userId không phải là UUID hợp lệ
            return ResponseEntity.status(401).build();
        }
    }

    @PutMapping()
    public ResponseEntity<UpdateProfileResponse> updateUserInfo(
            @RequestBody UpdateProfileRequest request,
            @Nullable Principal principal) {
        
        // Check if user is authenticated
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            // Get the user ID from the principal
            UUID userId = UUID.fromString(principal.getName());
            
            // Update the user profile and get the response
            UpdateProfileResponse response = endUserServices.updateUserProfile(userId, request);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // Handle invalid UUID
            return ResponseEntity.status(400).body(
                new UpdateProfileResponse(false, "Invalid user ID", null)
            );
        } catch (Exception e) {
            // Handle other exceptions
            return ResponseEntity.status(500).body(
                new UpdateProfileResponse(false, "Error updating profile: " + e.getMessage(), null)
            );
        }
    }
}
