package com.ticket.servermono.occacontext.adapters.controllers;

import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.occacontext.adapters.dtos.approval.ApprovalStatusUpdateRequest;
import com.ticket.servermono.occacontext.adapters.dtos.approval.OccaApprovalDetailResponse;
import com.ticket.servermono.occacontext.adapters.dtos.approval.OccaApprovalStatusResponse;
import com.ticket.servermono.occacontext.domain.enums.ApprovalStatus;
import com.ticket.servermono.occacontext.usecases.ApprovalServices;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/approval")
public class ApprovalController {

    private final ApprovalServices approvalServices;

    /**
     * Get occas for approval management with pagination
     * 
     * @param page Page number (default: 0)
     * @param size Items per page (default: 10)
     * @param status Approval status to filter (enum: "draft", "pending", "approved", "rejected")
     * @param search Search term for title
     * @param sort Sort field (enum: "title", "submittedAt", "approvalDate")
     * @param direction Sort direction (enum: "asc", "desc", default: "asc")
     * @return Page of OccaApprovalStatusResponse
     */
    @GetMapping("/occas")
    public ResponseEntity<Page<OccaApprovalStatusResponse>> getOccasForApproval(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        
        log.info("Getting occas for approval with page={}, size={}, status={}, search={}, sort={}, direction={}", 
                page, size, status, search, sort, direction);
        
        Page<OccaApprovalStatusResponse> result = approvalServices.getOccasForApprovalManagement(
                page, size, status, search, sort, direction);
        
        return ResponseEntity.ok(result);
    }

    /**
     * Update the approval status of an occa
     * 
     * @param id Occa ID
     * @param request Update request with new status and optional rejection reason
     * @return Success message
     */    @PutMapping("/occas/{id}/status")
    public ResponseEntity<?> updateApprovalStatus(
            @PathVariable String id,
            @RequestBody ApprovalStatusUpdateRequest request) {
        
        try {
            UUID occaId = UUID.fromString(id);
            ApprovalStatus status = ApprovalStatus.valueOf(request.getStatus().toUpperCase());
            
            approvalServices.updateApprovalStatus(occaId, status, request.getRejectionReason());
            
            return ResponseEntity.ok().body(
                    Map.of("message", "Approval status updated successfully"));
                    
        } catch (IllegalArgumentException e) {
            log.error("Invalid parameters for approval update: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            log.error("Error updating approval status: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Failed to update approval status: " + e.getMessage()));
        }
    }
    
    /**
     * Get detailed information about an occasion for approval purposes
     * 
     * @param id The occasion ID
     * @return Detailed information about the occasion
     */
    @GetMapping("/occas/{id}/detail")
    public ResponseEntity<?> getOccaDetailForApproval(@PathVariable String id) {
        log.info("Getting occa detail for approval with ID: {}", id);
        
        try {
            UUID occaId = UUID.fromString(id);
            OccaApprovalDetailResponse detailResponse = approvalServices.getOccaDetailForApproval(occaId);
            return ResponseEntity.ok(detailResponse);
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format: {}", id);
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid occasion ID format"));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Entity not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting occa detail for approval: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Failed to get occasion detail: " + e.getMessage()));
        }
    }
}
