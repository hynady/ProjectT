package com.ticket.servermono.ticketcontext.domain.enums;

/**
 * Enum for payment statuses
 */
public enum PaymentStatus {
    WAITING_PAYMENT,       // Đang chờ thanh toán
    PAYMENT_SUCCESS,       // Thanh toán thành công
    PAYMENT_FAILED,        // Thanh toán thất bại
    PAYMENT_EXPIRED,       // Thanh toán hết hạn
    PAYMENT_CANCELLED      // Thanh toán bị hủy
}