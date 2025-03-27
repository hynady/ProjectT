package com.ticket.servermono.occacontext.adapters.dtos.organizer;


import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizerOccaUnit {
    private UUID id;
    private String title;
    private String location;
    private String image;
    private String approvalStatus;
}