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
public class OccaDetailResponse {
    private BasicInfoDTO basicInfo;
    private List<ShowDTO> shows;
    private List<TicketDTO> tickets;
    private List<GalleryDTO> gallery;
}