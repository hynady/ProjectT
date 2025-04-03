package com.ticket.servermono.ticketcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response for ticket booking lock
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingLockResponse {
    // Thông tin tài khoản người nhận thanh toán (chủ website)
    private String soTaiKhoan;
    private String nganHang;
    private Double soTien;
    private String noiDung;
    private String status;
    private String paymentId;
}