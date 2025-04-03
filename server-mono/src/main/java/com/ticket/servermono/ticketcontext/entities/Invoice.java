package com.ticket.servermono.ticketcontext.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import com.ticket.servermono.ticketcontext.domain.enums.PaymentStatus;

/**
 * Stores invoice/booking information (completely separate from PaymentInfo)
 */
@Entity
@Table(name = "invoices")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Invoice extends BaseSQLEntity {
    
    @Column(name = "so_tien", nullable = false)
    private Double soTien;
    
    @Column(name = "noi_dung", nullable = false)
    private String noiDung;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;
    
    @Column(name = "payment_id", nullable = false, unique = true)
    private String paymentId;
    
    @Column(name = "show_id", nullable = true)
    private UUID showId;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
}