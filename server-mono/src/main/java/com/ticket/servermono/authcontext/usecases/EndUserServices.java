package com.ticket.servermono.authcontext.usecases;

import lombok.RequiredArgsConstructor;

import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.ticket.servermono.authcontext.entities.EndUser;
import com.ticket.servermono.authcontext.infrastructure.config.JWTUtils;
import com.ticket.servermono.authcontext.infrastructure.repositories.EndUserRepository;

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
}
