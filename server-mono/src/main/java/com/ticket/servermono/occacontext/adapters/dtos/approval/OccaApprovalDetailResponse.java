package com.ticket.servermono.occacontext.adapters.dtos.approval;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccaApprovalDetailResponse {
    private UUID id;
    private BasicInfoDTO basicInfo;
    private List<ShowDTO> shows;
    private List<TicketDTO> tickets;
    private List<GalleryDTO> gallery;
    private SubmissionDetailsDTO submissionDetails;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BasicInfoDTO {
        private String title;
        private String organizerName;
        private String location;
        private String address;
        private String description;
        private String bannerUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShowDTO {
        private String id;
        private String date;
        private String time;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketDTO {
        private String id;
        private String type; // This is the name of the TicketClass
        private Double price;
        private Integer quantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GalleryDTO {
        private String id;
        private String url;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmissionDetailsDTO {
        private LocalDateTime submittedAt;
        private String approvalStatus;
        private LocalDateTime approvedAt;
        private LocalDateTime rejectedAt;
        private String rejectionReason;
    }
}
