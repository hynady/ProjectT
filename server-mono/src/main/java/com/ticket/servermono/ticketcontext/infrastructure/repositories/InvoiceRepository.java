package com.ticket.servermono.ticketcontext.infrastructure.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ticket.servermono.ticketcontext.domain.enums.PaymentStatus;
import com.ticket.servermono.ticketcontext.entities.Invoice;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    
    Optional<Invoice> findByPaymentId(String paymentId);
    
    List<Invoice> findByStatusAndExpiresAtBefore(PaymentStatus status, LocalDateTime dateTime);
}