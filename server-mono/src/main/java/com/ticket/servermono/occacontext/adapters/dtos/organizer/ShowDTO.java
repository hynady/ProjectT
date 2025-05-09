package com.ticket.servermono.occacontext.adapters.dtos.organizer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowDTO {
    private String id;
    private String date;
    private String time;
    private String saleStatus; // upcoming, on_sale, sold_out, ended
    private Boolean autoUpdateStatus; // Optional: defaults to true if not specified
}