package com.ticket.servermono.searchcontext.adapters.dtos;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class SearchBarTemplateResponse {
    UUID id;
    String title;
    String date;
    String location;
}
