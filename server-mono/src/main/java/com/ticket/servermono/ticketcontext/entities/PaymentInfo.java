package com.ticket.servermono.ticketcontext.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * Stores payment account information (standalone entity)
 */
@Entity
@Table(name = "payment_info")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PaymentInfo extends BaseSQLEntity {
    
    @Column(name = "so_tai_khoan", nullable = false)
    private String soTaiKhoan;
    
    @Column(name = "ngan_hang", nullable = false)
    private String nganHang;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}   