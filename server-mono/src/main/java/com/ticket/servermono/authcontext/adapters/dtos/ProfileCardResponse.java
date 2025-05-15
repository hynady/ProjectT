package com.ticket.servermono.authcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileCardResponse {
    private boolean success;
    private String message;
    private ProfileDTO data;
}
