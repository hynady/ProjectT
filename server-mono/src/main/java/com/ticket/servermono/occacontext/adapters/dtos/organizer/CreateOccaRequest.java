package com.ticket.servermono.occacontext.adapters.dtos.organizer;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOccaRequest {
    private BasicInfoDTO basicInfo;
    private List<ShowDTO> shows;
    private List<TicketDTO> tickets;
    private List<GalleryDTO> gallery;
    private String status;
    private String approvalStatus;
    private Boolean autoUpdateStatus;  // Added for auto-update status mechanism
}