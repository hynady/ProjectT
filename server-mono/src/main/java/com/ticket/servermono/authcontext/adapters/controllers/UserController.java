package com.ticket.servermono.authcontext.adapters.controllers;

import com.ticket.servermono.authcontext.adapters.dtos.AdminUserDetailDTO;
import com.ticket.servermono.authcontext.adapters.dtos.UpdateProfileRequest;
import com.ticket.servermono.authcontext.adapters.dtos.UpdateProfileResponse;
import com.ticket.servermono.authcontext.adapters.dtos.UpdateUserStatusRequest;
import com.ticket.servermono.authcontext.adapters.dtos.UpdateUserStatusResponse;
import com.ticket.servermono.authcontext.adapters.dtos.UpdateUserRoleRequest;
import com.ticket.servermono.authcontext.adapters.dtos.UpdateUserRoleResponse;
import com.ticket.servermono.authcontext.adapters.dtos.UserInfoDTO;
import com.ticket.servermono.authcontext.adapters.dtos.UserListDTO;
import com.ticket.servermono.authcontext.usecases.EndUserServices;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;
import java.util.UUID;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("v1/user")
@RequiredArgsConstructor
@Slf4j
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
    }    @GetMapping("/users")
    public ResponseEntity<Page<UserListDTO>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        
        log.info("Getting users with page={}, size={}, status={}, role={}, search={}, sort={}, direction={}", 
                page, size, status, role, search, sort, direction);
        
        Page<UserListDTO> result = endUserServices.getUsersByRole(page, size, status, role, search, sort, direction);
        
        return ResponseEntity.ok(result);
    }
      @GetMapping("/users/{userId}/detail")
    public ResponseEntity<AdminUserDetailDTO> getUserDetail(@PathVariable UUID userId) {
        log.info("Getting user detail for userId={}", userId);
        
        try {
            AdminUserDetailDTO userDetail = endUserServices.getUserDetailForAdmin(userId);
            return ResponseEntity.ok(userDetail);
        } catch (RuntimeException e) {
            log.error("Error getting user detail: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<UpdateUserStatusResponse> updateUserStatus(
            @PathVariable UUID userId,
            @RequestBody UpdateUserStatusRequest request) {
        log.info("Updating status for userId={} to status={}", userId, request.getStatus());
        
        try {
            UpdateUserStatusResponse response = endUserServices.updateUserStatus(userId, request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (RuntimeException e) {
            log.error("Error updating user status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(UpdateUserStatusResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }
    
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<UpdateUserRoleResponse> updateUserRole(
            @PathVariable UUID userId,
            @RequestBody UpdateUserRoleRequest request) {
        log.info("Updating role for userId={} to role={}", userId, request.getRole());
        
        try {
            UpdateUserRoleResponse response = endUserServices.updateUserRole(userId, request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (RuntimeException e) {
            log.error("Error updating user role: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(UpdateUserRoleResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }
}
