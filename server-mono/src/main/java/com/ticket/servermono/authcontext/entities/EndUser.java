package com.ticket.servermono.authcontext.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.util.List;

import com.ticket.servermono.authcontext.domain.enums.UserStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Entity
@Table(name = "end_user",
    indexes = {
            @Index(name = "idx_end_user_email", columnList = "email")
    }
)
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class EndUser extends BaseSQLEntity {

    @Column(unique = true, nullable = false)
    private String email;

    private String name;

    @Column(length = 1000)
    private String avatar;

    private LocalDate birthday;

    @Column(nullable = false)
    private String password;    private String roles;

    @Enumerated(EnumType.STRING)
    @Column(name = "activated_status")
    private UserStatus activatedStatus;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private List<Profile> profiles;

    public EndUser(String email, String password) {
        this.email = email;
        this.password = encodePassword(password);
        this.roles = "ROLE_USER";
        this.activatedStatus = UserStatus.ACTIVE;
    }

    private String encodePassword(String rawPassword) {
        return new BCryptPasswordEncoder().encode(rawPassword);
    }
}