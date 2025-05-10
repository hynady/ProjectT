package com.ticket.servermono.ticketcontext.entities;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import org.checkerframework.checker.units.qual.C;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
    
    @Column(name = "user_id", nullable = true)
    private UUID userId;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    private String emailReceived;

    private String nameCustomer;

    private String phoneCustomer;

    /**
     * Lưu trữ thông tin chi tiết về các loại vé và số lượng đã đặt
     * Key: ID của TicketClass (UUID.toString())
     * Value: Số lượng vé đặt
     */
    @Column(name = "ticket_details", columnDefinition = "json")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Integer> ticketDetails = new HashMap<>();
}