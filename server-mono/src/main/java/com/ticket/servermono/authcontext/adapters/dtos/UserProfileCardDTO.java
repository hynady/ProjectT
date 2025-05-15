package com.ticket.servermono.authcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileCardDTO {
    private UUID id;
    private String name;
    private String phoneNumber;
    private String email;
    private Boolean isDefault;
}
