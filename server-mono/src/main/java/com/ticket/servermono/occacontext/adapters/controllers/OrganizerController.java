package com.ticket.servermono.occacontext.adapters.controllers;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.occacontext.adapters.dtos.organizer.CreateOccaRequest;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.CreateOccaResponse;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.OccaDetailResponse;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.OrganizerOccaUnit;
import com.ticket.servermono.occacontext.usecases.OrganizerServices;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/organize")
public class OrganizerController {

    private final OrganizerServices organizerServices;

    /**
     * Lấy danh sách sự kiện của người tổ chức
     * 
     * @param page Số trang (mặc định: 0)
     * @param size Số phần tử mỗi trang (mặc định: 10)
     * @param status Trạng thái sự kiện (enum: "draft", "pending", "approved", "rejected")
     * @param search Từ khóa tìm kiếm
     * @param sort Trường để sắp xếp (enum: "title", "location")
     * @param direction Hướng sắp xếp (enum: "asc", "desc", mặc định: "asc")
     * @return ResponseEntity<Page<OrganizerOccaUnit>> Danh sách sự kiện đã phân trang
     */
    @GetMapping("/occas")
    public ResponseEntity<Page<OrganizerOccaUnit>> getOccas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        
        log.info("Getting occas with page={}, size={}, status={}, search={}, sort={}, direction={}", 
                page, size, status, search, sort, direction);
        
        Page<OrganizerOccaUnit> result = organizerServices.getOrganizerOccas(
                page, size, status, search, sort, direction);
        
        return ResponseEntity.ok(result);
    }
    /**
     * Tạo mới sự kiện
     * 
     * @param request Thông tin để tạo sự kiện mới (bao gồm trường categoryId trong basicInfo)
     * @return ResponseEntity<CreateOccaResponse> Thông tin sự kiện đã tạo
     */
    @PostMapping("/occas")
    public ResponseEntity<CreateOccaResponse> createOcca(@RequestBody CreateOccaRequest request) {
        log.info("Creating new occa with title: {}, category: {}", 
                request.getBasicInfo() != null ? request.getBasicInfo().getTitle() : "unknown",
                request.getBasicInfo() != null ? request.getBasicInfo().getCategoryId() : "default");
        
        try {
            CreateOccaResponse response = organizerServices.createOcca(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (EntityNotFoundException e) {
            log.error("Entity not found when creating occa: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error creating occa", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Lấy chi tiết sự kiện để chỉnh sửa
     * 
     * @param id ID của sự kiện
     * @return Chi tiết sự kiện (bao gồm categoryId trong basicInfo)
     */
    @GetMapping("/occas/{id}")
    public ResponseEntity<?> getOccaDetail(@PathVariable String id) {
        try {
            UUID occaId = UUID.fromString(id);
            log.info("Getting occa detail with ID: {}", occaId);
            
            OccaDetailResponse response = organizerServices.getOccaDetail(occaId);
            log.info("Retrieved occa: {}, category: {}", 
                    response.getBasicInfo().getTitle(), 
                    response.getBasicInfo().getCategoryId());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format: {}", id, e);
            return ResponseEntity.badRequest().body("Invalid occa ID format");
        } catch (EntityNotFoundException e) {
            log.error("Occa not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting occa detail for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
        }
    }
    
    /**
     * Cập nhật thông tin sự kiện
     * 
     * @param id ID của sự kiện cần cập nhật
     * @param request Thông tin cập nhật của sự kiện (bao gồm trường categoryId trong basicInfo)
     * @return Thông tin sự kiện sau khi cập nhật
     */
    @PutMapping("/occas/{id}")
    public ResponseEntity<?> updateOcca(@PathVariable String id, @RequestBody CreateOccaRequest request) {
        try {
            UUID occaId = UUID.fromString(id);
            log.info("Updating occa with ID: {}, title: {}, category: {}", 
                    occaId, 
                    request.getBasicInfo() != null ? request.getBasicInfo().getTitle() : "unchanged",
                    request.getBasicInfo() != null ? request.getBasicInfo().getCategoryId() : "unchanged");
            
            CreateOccaResponse response = organizerServices.updateOcca(occaId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format: {}", id, e);
            return ResponseEntity.badRequest().body("Invalid occa ID format");
        } catch (EntityNotFoundException e) {
            log.error("Occa not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating occa with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
        }
    }
}