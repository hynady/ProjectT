package com.ticket.userserver.features.auth.repositories;

import com.ticket.userserver.features.auth.models.OTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface OTPRepository extends JpaRepository<OTP, String> {
    @Modifying
    @Query("DELETE FROM OTP o WHERE o.expiryDate < CURRENT_TIMESTAMP")
    void deleteExpiredOTPs();
}