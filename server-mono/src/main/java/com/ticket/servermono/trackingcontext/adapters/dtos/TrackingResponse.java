package com.ticket.servermono.trackingcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrackingResponse {
    private boolean success;
    private String message;
}
