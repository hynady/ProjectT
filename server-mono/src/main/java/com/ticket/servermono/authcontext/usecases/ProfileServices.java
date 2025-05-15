package com.ticket.servermono.authcontext.usecases;

import com.ticket.servermono.authcontext.adapters.dtos.*;
import com.ticket.servermono.authcontext.domain.enums.UserStatus;
import com.ticket.servermono.authcontext.entities.EndUser;
import com.ticket.servermono.authcontext.entities.Profile;
import com.ticket.servermono.authcontext.infrastructure.repositories.EndUserRepository;
import com.ticket.servermono.authcontext.infrastructure.repositories.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProfileServices {
    
    private final ProfileRepository profileRepository;
    private final EndUserRepository endUserRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * Get all profiles for a user
     * @param userIdStr User ID as string
     * @return List of profile DTOs
     */
    public List<ProfileDTO> getProfilesByEndUserId(String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        List<Profile> profiles = profileRepository.findByUserId(userId);
        
        return profiles.stream()
            .map(this::convertToProfileDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Create a new profile for a user
     * @param userIdStr User ID as string
     * @param request Profile creation request
     * @return Response with created profile
     */
    @Transactional
    public ProfileCardResponse createProfile(String userIdStr, CreateProfileRequest request) {
        UUID userId = UUID.fromString(userIdStr);
        
        // Check if the user exists
        EndUser user = endUserRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản người dùng"));
        
        // Check if this is the first profile (make it default if so)
        List<Profile> existingProfiles = profileRepository.findByUserId(userId);
        boolean isDefault = existingProfiles.isEmpty();
        
        // Create new profile
        Profile profile = new Profile();
        profile.setName(request.getName());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setEmail(request.getEmail());
        profile.setDefault(isDefault);
        profile.setUser(user); // Set the user association
        
        // Add profile to user's profiles collection if it's initialized
        if (user.getProfiles() != null) {
            user.getProfiles().add(profile);
        }
        
        // Save to repository
        Profile savedProfile = profileRepository.save(profile);
        
        log.info("Created new profile with ID {} for user {}", savedProfile.getId(), userId);
        
        // Return response
        return ProfileCardResponse.builder()
            .success(true)
            .message("Tạo thẻ thông tin thành công")
            .data(convertToProfileDTO(savedProfile))
            .build();
    }
    
    /**
     * Update an existing profile
     * @param profileId Profile ID
     * @param request Update request
     * @param userIdStr User ID as string for verification
     * @return Response with updated profile
     */
    @Transactional
    public ProfileCardResponse updateProfile(UUID profileId, UpdateProfileCardRequest request, String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        
        // Find the profile to update
        Profile profile = profileRepository.findById(profileId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy thẻ thông tin"));
        
        // Verify that the profile belongs to the current user
        List<Profile> userProfiles = profileRepository.findByUserId(userId);
        if (userProfiles.stream().noneMatch(p -> p.getId().equals(profileId))) {
            throw new RuntimeException("Không có quyền chỉnh sửa thẻ thông tin này");
        }
        
        // Update fields if provided
        if (request.getName() != null) {
            profile.setName(request.getName());
        }
        
        if (request.getPhoneNumber() != null) {
            profile.setPhoneNumber(request.getPhoneNumber());
        }
        
        if (request.getEmail() != null) {
            profile.setEmail(request.getEmail());
        }
        
        // Handle default status
        if (request.getIsDefault() != null && request.getIsDefault()) {
            // Clear default status of all other profiles
            userProfiles.forEach(p -> {
                if (!p.getId().equals(profileId)) {
                    p.setDefault(false);
                    profileRepository.save(p);
                }
            });
            profile.setDefault(true);
        }
        
        // Save updated profile
        Profile updatedProfile = profileRepository.save(profile);
        
        // Return response
        return ProfileCardResponse.builder()
            .success(true)
            .message("Cập nhật thẻ thông tin thành công")
            .data(convertToProfileDTO(updatedProfile))
            .build();
    }
    
    /**
     * Delete a profile
     * @param profileId Profile ID to delete
     * @param userIdStr User ID as string for verification
     * @return Response indicating success or failure
     */
    @Transactional
    public GenericResponse deleteProfile(UUID profileId, String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        
        // Find the profile to delete
        Profile profile = profileRepository.findById(profileId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy thẻ thông tin"));
        
        // Verify that the profile belongs to the current user
        List<Profile> userProfiles = profileRepository.findByUserId(userId);
        if (userProfiles.stream().noneMatch(p -> p.getId().equals(profileId))) {
            throw new RuntimeException("Không có quyền xóa thẻ thông tin này");
        }
        
        boolean wasDefault = profile.isDefault();
        
        // Delete the profile
        profileRepository.delete(profile);
        
        // If the deleted profile was default and there are other profiles, make another one default
        if (wasDefault && !userProfiles.isEmpty() && userProfiles.size() > 1) {
            Optional<Profile> otherProfile = userProfiles.stream()
                .filter(p -> !p.getId().equals(profileId))
                .findFirst();
            
            if (otherProfile.isPresent()) {
                Profile newDefaultProfile = otherProfile.get();
                newDefaultProfile.setDefault(true);
                profileRepository.save(newDefaultProfile);
            }
        }
        
        return GenericResponse.builder()
            .success(true)
            .message("Xóa thẻ thông tin thành công")
            .build();
    }
    
    /**
     * Delete a user account (soft delete)
     * @param userId User ID
     * @param request Delete account request with password for verification
     * @return Response indicating success or failure
     */
    @Transactional
    public GenericResponse deleteAccount(UUID userId, DeleteAccountRequest request) {
        // Verify user ID match
        if (!userId.equals(request.getUserId())) {
            throw new RuntimeException("Không thể xóa tài khoản của người dùng khác");
        }
        
        // Find the user
        EndUser user = endUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
          // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu không chính xác");
        }
        
        // Deactivate the user account by setting activatedStatus to INACTIVE
        user.setActivatedStatus(UserStatus.INACTIVE);
        endUserRepository.save(user);
        
        log.info("User account with ID {} has been deactivated", userId);
        
        return GenericResponse.builder()
                .success(true)
                .message("Tài khoản đã được xóa thành công")
                .build();
    }
    
    /**
     * Convert Profile entity to ProfileDTO
     * @param profile Profile entity
     * @return ProfileDTO
     */
    private ProfileDTO convertToProfileDTO(Profile profile) {
        return ProfileDTO.builder()
                .id(profile.getId())
                .name(profile.getName())
                .email(profile.getEmail())
                .phoneNumber(profile.getPhoneNumber())
                .isDefault(profile.isDefault())
                .build();
    }
}
