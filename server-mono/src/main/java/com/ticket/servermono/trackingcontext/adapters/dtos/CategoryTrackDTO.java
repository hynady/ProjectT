package com.ticket.servermono.trackingcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryTrackDTO {
    private UUID categoryId;
    private int count;
}
