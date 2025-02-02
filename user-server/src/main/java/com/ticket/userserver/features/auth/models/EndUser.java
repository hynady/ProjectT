package com.ticket.userserver.features.auth.models;

import com.ticket.userserver.commons.base.BaseSQLEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
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

    @Column(nullable = false)
    private String password;

    private String roles;

    public EndUser(String email, String password) {
        this.email = email;
        this.password = encodePassword(password);
        this.roles = "ROLE_USER";
    }

    private String encodePassword(String rawPassword) {
        return new BCryptPasswordEncoder().encode(rawPassword);
    }
}