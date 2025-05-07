package com.ticket.servermono.authcontext.usecases;

import com.ticket.servermono.authcontext.adapters.dtos.*;
import com.ticket.servermono.authcontext.domain.enums.UserRole;
import com.ticket.servermono.authcontext.domain.enums.UserStatus;
import com.ticket.servermono.authcontext.entities.EndUser;
import com.ticket.servermono.authcontext.entities.Profile;
import com.ticket.servermono.authcontext.entities.UserStat;
import com.ticket.servermono.authcontext.infrastructure.repositories.EndUserRepository;
import com.ticket.servermono.authcontext.infrastructure.repositories.UserStatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.authcontext.infrastructure.config.JWTUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class EndUserServices {    private final EndUserRepository eUserRepo;
    private final UserStatRepository userStatRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JWTUtils jwtUtils;

    public void newEndUser(String email, String password) {
        //TODO: Validate input
        //Create new user
        EndUser newUser = new EndUser(email, password);
        eUserRepo.save(newUser);
        System.out.println("Đã tạo mới user"+ newUser.getEmail());
    }

    // Login return jwt token
    public String login(String email, String password) {
        try {
            // Find user by email
            
            Optional<EndUser> eFoundUser = eUserRepo.findEndUserByEmail(email);
            if (eFoundUser.isEmpty()) {
                throw new RuntimeException("Email không tồn tại");
            }
            // Verify password
            if (!passwordEncoder.matches(password, eFoundUser.get().getPassword())) {
                throw new RuntimeException("Mật khẩu không đúng");
            }
            // Return token
            return jwtUtils.createToken(eFoundUser.get(), false);
        } catch (Exception e) {
            throw new RuntimeException("Thông tin đăng nhập chưa đúng");
        }
    }

    public void resetPassword(String email, String password) {
        // Find user by email
        Optional<EndUser> eFoundUser = eUserRepo.findEndUserByEmail(email);
        if (eFoundUser.isEmpty()) {
            throw new RuntimeException("Email không tồn tại");
        }
        // Update password
        eFoundUser.get().setPassword(passwordEncoder.encode(password));
        eUserRepo.save(eFoundUser.get());
    }
    
    /**
     * Kiểm tra xem người dùng có tồn tại không
     * @param userId ID của người dùng cần kiểm tra
     * @return true nếu người dùng tồn tại, false nếu không
     */
    public boolean isUserExist(UUID userId) {
        boolean exists = eUserRepo.findById(userId).isPresent();
        log.info("User existence check for {}: {}", userId, exists);
        return exists;
    }

    /**
     * Updates user profile information
     * @param userId The ID of the user to update
     * @param request The profile data to update
     * @return A response containing the updated user information
     */
    @Transactional
    public UpdateProfileResponse updateUserProfile(UUID userId, UpdateProfileRequest request) {
        // Find the user by ID
        EndUser user = eUserRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update the user fields if they're provided in the request
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        
        // Birthday might be null explicitly (user clears birthday field)
        user.setBirthday(request.getBirthday());
        
        // Save the updated user
        EndUser updatedUser = eUserRepo.save(user);
        
        // Convert to DTO and return response
        UserInfoDTO userInfoDTO = convertToUserInfoDTO(updatedUser);
        
        return UpdateProfileResponse.builder()
                .success(true)
                .message("Cập nhật thông tin thành công")
                .data(userInfoDTO)
                .build();
    }
    
    // Helper method to convert Entity to DTO
    private UserInfoDTO convertToUserInfoDTO(EndUser user) {
        return UserInfoDTO.builder()
            .id(user.getId())
            .name(user.getName() != null ? user.getName() : "")
            .email(user.getEmail() != null ? user.getEmail() : "")
            .avatar(user.getAvatar() != null ? user.getAvatar() : "")
            .birthday(user.getBirthday())
            .build();
    }
    
    public UserInfoDTO getUserInfo(UUID userId) {
        EndUser user = eUserRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return convertToUserInfoDTO(user);
    }    /**
     * Gets a detailed user profile for admin view
     * @param userId The ID of the user to get details for
     * @return A detailed DTO containing user information and statistics
     */
    @Transactional(readOnly = true)
    public AdminUserDetailDTO getUserDetailForAdmin(UUID userId) {
        // Find the user by ID
        EndUser user = eUserRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get or create user stats
        UserStat userStats = userStatRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserStat newStats = new UserStat(user);
                    return userStatRepository.save(newStats);
                });
        
        // Convert profiles to DTOs
        List<UserProfileCardDTO> profileDTOs = user.getProfiles() != null ?
                user.getProfiles().stream()
                    .map(this::convertToUserProfileCardDTO)
                    .collect(Collectors.toList()) :
                List.of();
        
        // For now, mock the last active time as current time
        LocalDateTime lastActive = LocalDateTime.now();
        
        // Build and return the response
        return AdminUserDetailDTO.builder()
                .id(user.getId().toString())                
                .name(user.getName() != null ? user.getName() : "")
                .email(user.getEmail())
                .role(user.getRoles())
                .status(user.getActivatedStatus().name().toLowerCase())
                .avatar(user.getAvatar())
                .createdAt(user.getCreatedAt())
                .lastActive(lastActive)
                .stats(convertToUserStatDTO(userStats))
                .profiles(profileDTOs)
                .build();
    }
    
    /**
     * Convert Profile entity to UserProfileCardDTO
     */
    private UserProfileCardDTO convertToUserProfileCardDTO(Profile profile) {
        return UserProfileCardDTO.builder()
                .id(profile.getId())
                .name(profile.getName())
                .isDefault(profile.isDefault())
                .phoneNumber(profile.getPhoneNumber())
                .email(profile.getEmail())
                .build();
    }
      /**
     * Convert UserStat entity to UserStatDTO
     */
    private UserStatDTO convertToUserStatDTO(UserStat userStat) {
        return UserStatDTO.builder()
                .eventsAttended(userStat.getEventsAttended())
                .eventsOrganized(userStat.getEventsOrganized())
                .ticketsPurchased(userStat.getTicketsPurchased())
                .totalSpent(userStat.getTotalSpent())
                .build();
    }
    
    /**
     * Update user's activation status
     * @param userId The ID of the user to update
     * @param statusRequest The status update request containing the new status
     * @return Response with update status and message
     */
    @Transactional
    public UpdateUserStatusResponse updateUserStatus(UUID userId, UpdateUserStatusRequest statusRequest) {
        // Find the user by ID
        EndUser user = eUserRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Validate and convert status
        String requestedStatus = statusRequest.getStatus().toLowerCase();
        UserStatus newStatus;
        
        switch (requestedStatus) {
            case "active":
                newStatus = UserStatus.ACTIVE;
                break;
            case "inactive":
                newStatus = UserStatus.INACTIVE;
                break;
            default:
                return UpdateUserStatusResponse.builder()
                        .success(false)
                        .message("Invalid status value. Valid values are 'active' or 'inactive'")
                        .status(user.getActivatedStatus().name().toLowerCase())
                        .build();
        }
        
        // If status isn't changing, return early
        if (user.getActivatedStatus() == newStatus) {
            return UpdateUserStatusResponse.builder()
                    .success(true)
                    .message("User status already set to " + requestedStatus)
                    .status(requestedStatus)
                    .build();
        }
        
        // Update the status
        user.setActivatedStatus(newStatus);
        eUserRepo.save(user);
        
        // Log the status change
        log.info("User ID {} status changed from {} to {}", 
                userId, 
                user.getActivatedStatus(), 
                newStatus);
        
        // Return success response
        return UpdateUserStatusResponse.builder()
                .success(true)
                .message("User status updated successfully")
                .status(requestedStatus)
                .build();
    }    @Transactional(readOnly = true)
    public Page<UserListDTO> getUsersByRole(int page, int size, String status, String role, String search, String sort, String direction) {
        log.info("Getting users with page={}, size={}, status={}, role={}, search={}, sort={}, direction={}", 
                page, size, status, role, search, sort, direction);
        
        // Create sort specification
        Sort.Direction sortDirection = Sort.Direction.ASC;
        if (direction != null && direction.equalsIgnoreCase("desc")) {
            sortDirection = Sort.Direction.DESC;
        }
        
        String sortField = "createdAt"; // default sort by created date
        if (sort != null) {
            switch (sort.toLowerCase()) {
                case "name":
                    sortField = "name";
                    break;
                case "email":
                    sortField = "email";
                    break;
                default:
                    sortField = "createdAt"; // Default to creation date
            }
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortField));

        // Convert status string to UserStatus enum for repository
        UserStatus statusEnum = null; // Default to null for all statuses
        if (status != null) {
            switch (status.toLowerCase()) {
                case "active":
                    statusEnum = UserStatus.ACTIVE;
                    break;
                case "inactive":
                    statusEnum = UserStatus.INACTIVE;
                    break;
                default:
                    break;
            }
        }        // Convert role to enum value if provided, otherwise keep null to return all roles
        String roleFilter = null;
        if (role != null) {
            switch (role.toLowerCase()) {
                case "role_user":
                    roleFilter = UserRole.ROLE_USER.name();
                    break;
                case "role_admin":
                    roleFilter = UserRole.ROLE_ADMIN.name();
                    break;
                default:
                    // Invalid role value provided, but we'll return all roles instead of empty
                    log.warn("Invalid role value '{}' provided, returning all roles", role);
            }
        }
        
        // When role and status are null, return users with any role/status
        Page<EndUser> userPage = eUserRepo.findByRoleAndDeletedStatusAndSearch(
                roleFilter, statusEnum, search, pageable);
        
        // Map to response DTOs with proper status handling
        return userPage.map(user -> convertToUserListDTO(user, status));
    }

    // Helper method to convert Entity to UserListDTO with requested status
    private UserListDTO convertToUserListDTO(EndUser user, String requestedStatus) {
        // For now, we'll mock lastActive as current time, as per requirement
        LocalDateTime lastActive = LocalDateTime.now();
        
        // Determine user status based on activatedStatus field
        String status;
        if (user.getActivatedStatus() == UserStatus.INACTIVE) {
            // If status was specifically requested as "inactive", use that
            if (requestedStatus != null && requestedStatus.equalsIgnoreCase("inactive")) {
                status = requestedStatus.toLowerCase();
            } else {
                status = UserStatus.INACTIVE.name().toLowerCase();
            }
        } else {
            status = UserStatus.ACTIVE.name().toLowerCase();
        }
        
        return UserListDTO.builder()
            .id(user.getId())
            .name(user.getName() != null ? user.getName() : "")
            .email(user.getEmail())
            .role(user.getRoles().toLowerCase()) // Also lowercase the role
            .status(status)
            .createdAt(user.getCreatedAt())
            .lastActive(lastActive)
            .build();
    }
    
    /**
     * Update user's role
     * @param userId The ID of the user to update
     * @param roleRequest The role update request containing the new role
     * @return Response with update status and message
     */
    @Transactional
    public UpdateUserRoleResponse updateUserRole(UUID userId, UpdateUserRoleRequest roleRequest) {
        // Find the user by ID
        EndUser user = eUserRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Validate and convert role
        String requestedRole = roleRequest.getRole().toUpperCase();
        String newRole;
        
        switch (requestedRole) {
            case "ROLE_ADMIN":
            case "ROLE_USER":
                newRole = requestedRole;
                break;
            default:
                return UpdateUserRoleResponse.builder()
                        .success(false)
                        .message("Invalid role value. Valid values are 'role_admin' or 'role_user'")
                        .role(user.getRoles().toLowerCase())
                        .build();
        }
        
        // If role isn't changing, return early
        if (user.getRoles().equals(newRole)) {
            return UpdateUserRoleResponse.builder()
                    .success(true)
                    .message("User role already set to " + requestedRole.toLowerCase())
                    .role(requestedRole.toLowerCase())
                    .build();
        }
        
        // Update the role
        user.setRoles(newRole);
        eUserRepo.save(user);
        
        // Log the role change
        log.info("User ID {} role changed from {} to {}", 
                userId, 
                user.getRoles(), 
                newRole);
        
        // Return success response
        return UpdateUserRoleResponse.builder()
                .success(true)
                .message("User role updated successfully")
                .role(newRole.toLowerCase())
                .build();
    }
    
    /**
     * Gets the role of a user
     * @param userId The ID of the user
     * @return The user's role as a lowercase string
     */
    @Transactional(readOnly = true)
    public String getUserRole(UUID userId) {
        // Find the user by ID
        EndUser user = eUserRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Return the role in lowercase
        return user.getRoles().toLowerCase();
    }
}
