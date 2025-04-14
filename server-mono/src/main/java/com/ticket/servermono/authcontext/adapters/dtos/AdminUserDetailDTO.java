package com.ticket.servermono.authcontext.adapters.dtos;

import com.ticket.servermono.authcontext.domain.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDetailDTO {
    private String id;
    private String name;
    private String email;
    private String role;
    private String status;
    private String avatar;
    private LocalDateTime createdAt;
    private LocalDateTime lastActive;
    private UserStatDTO stats;
    private List<UserProfileCardDTO> profiles;
}
