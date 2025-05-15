package com.ticket.servermono.mailcontext.entities;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(indexes = {
    @Index(name = "idx_email", columnList = "email")
})
public class OTP {
    @Id
    private String email;
    private String code;
    private LocalDateTime expiryDate;
    private boolean isUsed;

    public OTP(String email, String code) {
        this.email = email;
        this.code = code;
        this.expiryDate = LocalDateTime.now().plusMinutes(5);
        this.isUsed = false;
    }
}