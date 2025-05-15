package com.ticket.servermono.occacontext.usecases;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.occacontext.adapters.dtos.approval.OccaApprovalDetailResponse;

import com.ticket.servermono.occacontext.adapters.dtos.approval.OccaApprovalStatusResponse;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.TicketDTO;
import com.ticket.servermono.occacontext.domain.enums.ApprovalStatus;
import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.entities.OccaDetailInfo;
import com.ticket.servermono.occacontext.entities.Show;
import com.ticket.servermono.occacontext.infrastructure.clients.TicketClassGrpcClient;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaDetailInfoRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.ShowRepository;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalServices {

    private final OccaRepository occaRepository;
    private final ShowRepository showRepository;
    private final OccaDetailInfoRepository occaDetailInfoRepository;
    private final TicketClassGrpcClient ticketClassGrpcClient;

    /**
     * Get occasions for approval management with pagination
     * 
     * @param page Page number (0-indexed)
     * @param size Number of items per page
     * @param status Filter by approval status
     * @param search Search term for title
     * @param sort Sort field (title, submittedAt, approvalStatusUpdateAt)
     * @param direction Sort direction (asc or desc)
     * @return Page of OccaApprovalStatusResponse
     */
    @Transactional(readOnly = true)
    public Page<OccaApprovalStatusResponse> getOccasForApprovalManagement(
            int page, 
            int size, 
            String status, 
            String search, 
            String sort, 
            String direction) {
        
        log.info("Getting occas for approval management with page={}, size={}, status={}, search={}, sort={}, direction={}", 
                page, size, status, search, sort, direction);
        
        // Parse status if provided
        ApprovalStatus approvalStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                approvalStatus = ApprovalStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid approval status: {}", status);
            }
        }
        
        // Create sort specification
        Sort.Direction sortDirection = Sort.Direction.ASC;
        if (direction != null && direction.equalsIgnoreCase("desc")) {
            sortDirection = Sort.Direction.DESC;
        }
        
        String sortField = "createdAt"; // default sort by submission date
        if (sort != null) {
            switch (sort.toLowerCase()) {
                case "title":
                    sortField = "title";
                    break;
                case "approvaldate":
                    sortField = "approvalStatusUpdateAt";
                    break;
                default:
                    sortField = "createdAt"; // Default to submission date
            }
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortField));
        
        // Get occas from repository
        Page<Occa> occaPage = occaRepository.findForApprovalManagement(approvalStatus, search, pageable);
        
        // Map to response DTOs
        return occaPage.map(this::mapToApprovalStatusResponse);
    }

    /**
     * Update the approval status of an occasion
     *
     * @param occaId ID of the occasion
     * @param approvalStatus New approval status
     * @param rejectionReason Reason for rejection (required if status is REJECTED)
     */
    @Transactional
    public void updateApprovalStatus(UUID occaId, ApprovalStatus approvalStatus, String rejectionReason) {
        Occa occa = occaRepository.findById(occaId)
                .orElseThrow(() -> new RuntimeException("Occa not found with id: " + occaId));

        // If rejecting, reason is required
        if (approvalStatus == ApprovalStatus.REJECTED && (rejectionReason == null || rejectionReason.trim().isEmpty())) {
            throw new IllegalArgumentException("Rejection reason is required when rejecting an occasion");
        }

        occa.setApprovalStatus(approvalStatus);
        occa.setApprovalStatusUpdateAt(LocalDateTime.now());
        
        if (approvalStatus == ApprovalStatus.REJECTED) {
            occa.setRejectionReason(rejectionReason);
        } else {
            occa.setRejectionReason(null); // Clear rejection reason if not rejected
        }

        occaRepository.save(occa);
        log.info("Updated approval status of occa {} to {}", occaId, approvalStatus);
    }
    
    /**
     * Maps an Occa entity to OccaApprovalStatusResponse
     */    private OccaApprovalStatusResponse mapToApprovalStatusResponse(Occa occa) {
        String organizerName = occa.getDetailInfo() != null ? 
                occa.getDetailInfo().getOrganizer() : "Unknown";
        
        String location = occa.getVenue() != null ? 
                occa.getVenue().getLocation() : "Unknown location";
        
        LocalDateTime approvedAt = null;
        LocalDateTime rejectedAt = null;
        
        // Set approvedAt or rejectedAt based on approval status
        if (occa.getApprovalStatus() == ApprovalStatus.APPROVED) {
            approvedAt = occa.getApprovalStatusUpdateAt();
        } else if (occa.getApprovalStatus() == ApprovalStatus.REJECTED) {
            rejectedAt = occa.getApprovalStatusUpdateAt();
        }
          return OccaApprovalStatusResponse.builder()
                .id(occa.getId())
                .title(occa.getTitle())
                .organizerName(organizerName)
                .location(location)
                .image(occa.getImage())
                .approvalStatus(occa.getApprovalStatus() != null ? occa.getApprovalStatus().name().toLowerCase() : null)
                .submittedAt(occa.getCreatedAt())
                .approvedAt(approvedAt)
                .rejectedAt(rejectedAt)
                .rejectionReason(occa.getRejectionReason())
                .build();
    }
    
    /**
     * Get detailed information about an occasion for approval purposes
     * 
     * @param occaId ID of the occasion
     * @return OccaApprovalDetailResponse with detailed information
     */
    @Transactional(readOnly = true)
    public OccaApprovalDetailResponse getOccaDetailForApproval(UUID occaId) {
        log.info("Getting occa detail for approval with ID: {}", occaId);
        
        // Find the occa
        Occa occa = occaRepository.findById(occaId)
                .orElseThrow(() -> new EntityNotFoundException("Occa not found with id: " + occaId));
                
        // Find occa details
        OccaDetailInfo detailInfo = occaDetailInfoRepository.findByOccaId(occaId)
                .orElseThrow(() -> new EntityNotFoundException("Occa detail info not found for occa id: " + occaId));
                
        // Find all shows for this occa
        List<Show> shows = showRepository.findByOccaId(occaId);
        
        // Build basic info
        OccaApprovalDetailResponse.BasicInfoDTO basicInfo = OccaApprovalDetailResponse.BasicInfoDTO.builder()
                .title(occa.getTitle())
                .organizerName(detailInfo.getOrganizer())
                .location(occa.getVenue() != null ? occa.getVenue().getLocation() : "Unknown")
                .address(occa.getVenue() != null ? occa.getVenue().getAddress() : "")
                .description(detailInfo.getDescription())
                .bannerUrl(occa.getImage())
                .build();
                
        // Map shows
        List<OccaApprovalDetailResponse.ShowDTO> showDTOs = shows.stream()
                .map(show -> OccaApprovalDetailResponse.ShowDTO.builder()
                        .id(show.getId().toString())
                        .date(show.getDate().toString())
                        .time(show.getTime().toString())
                        .build())
                .collect(Collectors.toList());
                
        // Get tickets/ticket classes for all shows
        List<OccaApprovalDetailResponse.TicketDTO> ticketDTOs = new ArrayList<>();
        for (Show show : shows) {
            try {
                // Fetch ticket classes from gRPC service
                List<TicketDTO> showTickets = ticketClassGrpcClient
                            .getTicketClassesByShowId(show.getId().toString());
                
                // Map ticket classes to DTOs
                ticketDTOs.addAll(showTickets.stream()
                        .map(tc -> OccaApprovalDetailResponse.TicketDTO.builder()
                                .id(tc.getId().toString())
                                .type(tc.getType()) // Using name as type
                                .price(tc.getPrice())
                                .quantity(tc.getAvailableQuantity())
                                .build())
                        .collect(Collectors.toList()));
            } catch (Exception e) {
                log.error("Error fetching ticket classes for show {}: {}", show.getId(), e.getMessage());
            }
        }
        
        // Map gallery
        List<OccaApprovalDetailResponse.GalleryDTO> galleryDTOs = new ArrayList<>();
        if (detailInfo.getGalleryUrls() != null) {
            galleryDTOs = IntStream.range(0, detailInfo.getGalleryUrls().size())
                    .mapToObj(i -> OccaApprovalDetailResponse.GalleryDTO.builder()
                            .id(String.valueOf(i)) // Using index as ID
                            .url(detailInfo.getGalleryUrls().get(i))
                            .build())
                    .collect(Collectors.toList());
        }
        
        // Determine approval times
        LocalDateTime approvedAt = null;
        LocalDateTime rejectedAt = null;
        if (occa.getApprovalStatus() == ApprovalStatus.APPROVED && occa.getApprovalStatusUpdateAt() != null) {
            approvedAt = occa.getApprovalStatusUpdateAt();
        } else if (occa.getApprovalStatus() == ApprovalStatus.REJECTED && occa.getApprovalStatusUpdateAt() != null) {
            rejectedAt = occa.getApprovalStatusUpdateAt();
        }
        
        // Build submission details
        OccaApprovalDetailResponse.SubmissionDetailsDTO submissionDetails = 
                OccaApprovalDetailResponse.SubmissionDetailsDTO.builder()
                        .submittedAt(occa.getCreatedAt())
                        .approvalStatus(occa.getApprovalStatus() != null ? 
                                occa.getApprovalStatus().name().toLowerCase() : null)
                        .approvedAt(approvedAt)
                        .rejectedAt(rejectedAt)
                        .rejectionReason(occa.getRejectionReason())
                        .build();
        
        // Build the complete response
        return OccaApprovalDetailResponse.builder()
                .id(occa.getId())
                .basicInfo(basicInfo)
                .shows(showDTOs)
                .tickets(ticketDTOs)
                .gallery(galleryDTOs)
                .submissionDetails(submissionDetails)
                .build();
    }
}
