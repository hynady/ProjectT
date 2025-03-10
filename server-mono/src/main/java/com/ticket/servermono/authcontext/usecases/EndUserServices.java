package com.ticket.servermono.authcontext.usecases;

import com.ticket.servermono.authcontext.adapters.dtos.UpdateProfileRequest;
import com.ticket.servermono.authcontext.adapters.dtos.UpdateProfileResponse;
import com.ticket.servermono.authcontext.adapters.dtos.UserInfoDTO;
import com.ticket.servermono.authcontext.entities.EndUser;
import com.ticket.servermono.authcontext.infrastructure.repositories.EndUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.authcontext.infrastructure.config.JWTUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class EndUserServices {

    private final EndUserRepository eUserRepo;
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
                .name(user.getName())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .birthday(user.getBirthday())
                .build();
    }
    
    public UserInfoDTO getUserInfo(UUID userId) {
        EndUser user = eUserRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return convertToUserInfoDTO(user);
    }

    public String getAvatar(UUID userId) {
        return eUserRepo.findAvatarById(userId);
    }
}
