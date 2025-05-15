package com.ticket.servermono.mailcontext.infrastructure.repositories;

import com.ticket.servermono.mailcontext.entities.OTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface OTPRepository extends JpaRepository<OTP, String> {
    @Modifying
    @Query("DELETE FROM OTP o WHERE o.expiryDate < CURRENT_TIMESTAMP")
    void deleteExpiredOTPs();
}