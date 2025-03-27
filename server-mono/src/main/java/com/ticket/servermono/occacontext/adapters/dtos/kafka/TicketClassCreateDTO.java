package com.ticket.servermono.occacontext.adapters.dtos.kafka;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketClassCreateDTO {
    private UUID id; // Thêm trường id để có thể cập nhật ticket class hiện có
    private UUID showId;
    private String type;
    private double price;
    private int availableQuantity;
}