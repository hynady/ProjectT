package com.ticket.servermono.occacontext.adapters.controllers;

import java.security.Principal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
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

import com.ticket.servermono.occacontext.adapters.dtos.organizer.AnalyticsOverviewResponse;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.CreateOccaRequest;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.CreateOccaResponse;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.DailyVisitorsItem;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.OccaAnalyticsResponse;
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
public class OrganizerController {    private final OrganizerServices organizerServices;

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
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        
        if (principal == null) {
            log.error("No authenticated user found");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        log.info("Getting occas with page={}, size={}, status={}, search={}, sort={}, direction={}, userId={}",
                page, size, status, search, sort, direction, principal.getName());
        // Lấy userId từ principal
        UUID userId = UUID.fromString(principal.getName());
        
        // Chuyển đổi tham số sort và direction
        Page<OrganizerOccaUnit> result = organizerServices.getOrganizerOccas(
                page, size, status, search, sort, direction, userId);

        return ResponseEntity.ok(result);
    }
    /**
     * Tạo mới sự kiện
     * 
     * @param request Thông tin để tạo sự kiện mới (bao gồm trường categoryId trong basicInfo)
     * @return ResponseEntity<CreateOccaResponse> Thông tin sự kiện đã tạo
     */
    @PostMapping("/occas")
    public ResponseEntity<?> createOcca(@RequestBody CreateOccaRequest request, Principal principal) {
        log.info("Creating new occa with title: {}, category: {}, userId: {}", 
                request.getBasicInfo() != null ? request.getBasicInfo().getTitle() : "unknown",
                request.getBasicInfo() != null ? request.getBasicInfo().getCategoryId() : "default",
                principal.getName());

        // Lấy userId từ principal
        UUID userId = UUID.fromString(principal.getName());

        try {
            CreateOccaResponse response = organizerServices.createOcca(request, userId);
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
      /**
     * Lấy tổng quan phân tích dữ liệu sự kiện của người tổ chức
     * 
     * @param principal Thông tin người dùng đăng nhập
     * @param from Thời điểm bắt đầu phân tích (ISO-8601 format)
     * @param to Thời điểm kết thúc phân tích (ISO-8601 format)
     * @return Dữ liệu phân tích tổng quan
     */
    @GetMapping("/analytics/overview")
    public ResponseEntity<?> getOverviewAnalytics(
            Principal principal,
            @RequestParam(name = "from", required = true) String fromStr,
            @RequestParam(name = "to", required = true) String toStr) {
        try {
            if (principal == null) {
                log.error("No authenticated user found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User must be authenticated");
            }            // Parse thời gian ISO-8601 với timezone
            Instant fromInstant = Instant.parse(fromStr);
            Instant toInstant = Instant.parse(toStr);
            
            // Chuyển đổi sang LocalDateTime ở múi giờ của hệ thống
            ZoneId systemZone = ZoneId.systemDefault();
            LocalDateTime from = LocalDateTime.ofInstant(fromInstant, systemZone);
            LocalDateTime to = LocalDateTime.ofInstant(toInstant, systemZone);
            
            // Validate khoảng thời gian
            if (from.isAfter(to)) {
                return ResponseEntity.badRequest().body("Start date must be before end date");
            }

            // Lấy userId từ principal
            UUID userId = UUID.fromString(principal.getName());
            log.info("Getting analytics overview for user ID: {} from {} to {}", userId, from, to);
            
            // Lấy dữ liệu phân tích
            AnalyticsOverviewResponse response = organizerServices.getOverviewAnalytics(userId, from, to);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format or date format", e);
            return ResponseEntity.badRequest()
                    .body("Invalid format. User ID must be UUID and dates must be in ISO-8601 format");
        } catch (Exception e) {
            log.error("Error getting analytics overview: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
        }
    }    
    /**
     * Lấy dữ liệu trendline số lượt truy cập theo ngày
     * 
     * @param principal Thông tin người dùng đăng nhập
     * @param from Thời điểm bắt đầu phân tích (ISO-8601 format)
     * @param to Thời điểm kết thúc phân tích (ISO-8601 format)
     * @return Danh sách số lượt truy cập theo ngày
     */
    @GetMapping("/analytics/visitors/trend")
    public ResponseEntity<?> getTrendlineAnalytics(
            Principal principal,
            @RequestParam(name = "from", required = true) String fromStr,
            @RequestParam(name = "to", required = true) String toStr) {
        try {
            if (principal == null) {
                log.error("No authenticated user found");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User must be authenticated");
            }

            // Parse thời gian ISO-8601 với timezone
            Instant fromInstant = Instant.parse(fromStr);
            Instant toInstant = Instant.parse(toStr);
            
            // Chuyển đổi sang LocalDateTime ở múi giờ UTC+7
            ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
            LocalDateTime from = LocalDateTime.ofInstant(fromInstant, vietnamZone);
            LocalDateTime to = LocalDateTime.ofInstant(toInstant, vietnamZone);
            
            // Validate khoảng thời gian
            if (from.isAfter(to)) {
                return ResponseEntity.badRequest().body("Start date must be before end date");
            }

            // Lấy userId từ principal
            UUID userId = UUID.fromString(principal.getName());
            log.info("Getting trendline analytics for user ID: {} from {} to {}", userId, from, to);
            
            // Lấy dữ liệu trendline
            List<DailyVisitorsItem> response = organizerServices.getTrendlineAnalytics(userId, from, to);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format or date format", e);
            return ResponseEntity.badRequest()
                    .body("Invalid format. User ID must be UUID and dates must be in ISO-8601 format");
        } catch (Exception e) {
            log.error("Error getting trendline analytics: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
        }
    }    /**
     * Lấy danh sách phân tích sự kiện của người tổ chức với phân trang
     *
     * @param principal  User principal để lấy userId
     * @param page       Số trang (mặc định: 1)
     * @param pageSize   Số phần tử mỗi trang (mặc định: 10)
     * @param from       Thời gian bắt đầu tính (format: ISO-8601, e.g. 2025-04-28T17:00:00.000Z)
     * @param to         Thời gian kết thúc tính (format: ISO-8601, e.g. 2025-05-06T16:59:59.999Z)
     * @param sortField  Trường để sắp xếp (reach, revenue, fillRate)
     * @param sortOrder  Hướng sắp xếp (asc, desc)
     * @return ResponseEntity<OccaAnalyticsResponse> Danh sách phân tích sự kiện đã phân trang
     */
    @GetMapping("/analytics/occas")
    public ResponseEntity<OccaAnalyticsResponse> getOccaAnalytics(
            Principal principal,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(name = "from", required = false) String fromDateStr,
            @RequestParam(name = "to", required = false) String toDateStr,
            @RequestParam(required = false, defaultValue = "reach") String sortField,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder) {
        
        try {
            // Lấy userId từ principal
            UUID userId = UUID.fromString(principal.getName());
              // Chuyển đổi tham số thời gian
            LocalDateTime fromDate = null;
            LocalDateTime toDate = null;
            
            if (fromDateStr != null && !fromDateStr.isEmpty()) {
                // Format: 2025-04-28T17:00:00.000Z
                Instant fromInstant = Instant.parse(fromDateStr);
                fromDate = LocalDateTime.ofInstant(fromInstant, ZoneId.systemDefault());
            }
            
            if (toDateStr != null && !toDateStr.isEmpty()) {
                // Format: 2025-05-06T16:59:59.999Z
                Instant toInstant = Instant.parse(toDateStr);
                toDate = LocalDateTime.ofInstant(toInstant, ZoneId.systemDefault());
            }
              // Gọi service để lấy dữ liệu phân tích - trừ 1 vì page bắt đầu từ 1 trong API nhưng bắt đầu từ 0 trong code
            OccaAnalyticsResponse response = organizerServices.getOccaAnalytics(
                userId, page - 1, pageSize, fromDate, toDate, sortField, sortOrder);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid userId format: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error retrieving occa analytics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}