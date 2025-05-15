package com.ticket.servermono.authcontext.infrastructure.config;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import com.ticket.servermono.authcontext.domain.enums.UserStatus;
import com.ticket.servermono.authcontext.entities.EndUser;
import com.ticket.servermono.authcontext.infrastructure.repositories.EndUserRepository;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class AuthDataInitializer {

    // Định danh email cho user hệ thống
    public static final String SYSTEM_USER_EMAIL = "system@projectt.local";
    
    // Lưu trữ ID của system user - được cập nhật khi ứng dụng khởi động
    private static final AtomicReference<UUID> systemUserIdRef = new AtomicReference<>();
    
    /**
     * Lấy ID của system user
     * @return UUID của system user hoặc null nếu chưa khởi tạo
     */
    public static UUID getSystemUserId() {
        return systemUserIdRef.get();
    }
    
    @Bean
    @Order(1) // Ưu tiên cao nhất để đảm bảo chạy sớm
    CommandLineRunner initAuthData(EndUserRepository endUserRepository) {
        return args -> {
            log.info("Initializing Auth data...");
            
            // Kiểm tra xem user hệ thống đã tồn tại chưa
            Optional<EndUser> systemUser = endUserRepository.findEndUserByEmail(SYSTEM_USER_EMAIL);
            
            if (systemUser.isEmpty()) {
                log.info("Creating initial system user with email: {}", SYSTEM_USER_EMAIL);
                
                // Tạo user hệ thống mới
                EndUser user = new EndUser();
                user.setEmail(SYSTEM_USER_EMAIL);
                user.setPassword("$2a$10$3LptJUZgPJfFZTJpfTpZBejpMsEwWcSG3LhcqLOJYpUMAY3tQnYV2"); // Pre-encoded "system"
                user.setRoles("ROLE_ADMIN");
                user.setActivatedStatus(UserStatus.ACTIVE);
                user.setName("System User");
                
                EndUser savedUser = endUserRepository.save(user);
                log.info("Initial system user created successfully with ID: {}", savedUser.getId());
                
                // Lưu ID của user hệ thống để sử dụng sau này
                systemUserIdRef.set(savedUser.getId());
            } else {
                log.info("System user already exists with ID: {}", systemUser.get().getId());
                // Lưu ID của user hệ thống đã tồn tại
                systemUserIdRef.set(systemUser.get().getId());
            }
        };
    }
}
