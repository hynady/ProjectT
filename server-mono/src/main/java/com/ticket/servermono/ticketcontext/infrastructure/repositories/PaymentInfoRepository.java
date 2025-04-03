package com.ticket.servermono.ticketcontext.infrastructure.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ticket.servermono.ticketcontext.entities.PaymentInfo;

@Repository
public interface PaymentInfoRepository extends JpaRepository<PaymentInfo, UUID> {
    
    @Query("SELECT p FROM PaymentInfo p WHERE p.isActive = true ORDER BY p.createdAt DESC LIMIT 1")
    Optional<PaymentInfo> findActivePaymentInfo();
}