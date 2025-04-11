package com.ticket.servermono.occacontext.adapters.dtos.approval;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ticket.servermono.occacontext.domain.enums.ApprovalStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccaApprovalStatusResponse {    private UUID id;
    private String title;
    private String organizerName;
    private String location;
    private String image;
    private String approvalStatus;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;
    private String rejectionReason;
}
