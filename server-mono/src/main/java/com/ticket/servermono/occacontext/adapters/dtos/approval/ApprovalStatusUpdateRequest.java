package com.ticket.servermono.occacontext.adapters.dtos.approval;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
    @AllArgsConstructor
public class ApprovalStatusUpdateRequest {
        private String status;
        private String rejectionReason;
}
