package com.ticket.servermono.occacontext.adapters.dtos.Booking;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class OccaForBookingResponse {
    private UUID id;
    private String title;
    private String address;
    private String location;
}
