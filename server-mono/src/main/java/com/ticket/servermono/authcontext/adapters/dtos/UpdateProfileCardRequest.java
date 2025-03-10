package com.ticket.servermono.authcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileCardRequest {
    private UUID id;
    private String name;
    private String phoneNumber;
    private String email;
    private Boolean isDefault;
}
