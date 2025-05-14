package com.ticket.servermono.ticketcontext.adapters.dtos;

import java.util.UUID;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO containing ticket information with recipient details
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketWithRecipientInfoResponse {
    private UUID ticketId;
    private String ticketType;
    private double ticketPrice;
    private UUID showId;
    private String showDate;
    private String showTime;
    private String occaTitle;
    private String recipientName;
    private String recipientEmail;
    private String recipientPhone;
    private String checkedInAt;
    private LocalDateTime purchasedAt;
    private UUID invoiceId;
    private String paymentId;
}
