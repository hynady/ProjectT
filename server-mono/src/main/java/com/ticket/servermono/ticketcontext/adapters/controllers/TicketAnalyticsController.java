package com.ticket.servermono.ticketcontext.adapters.controllers;

import java.security.Principal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.ticketcontext.adapters.dtos.DailyRevenueItem;
import com.ticket.servermono.ticketcontext.adapters.dtos.RevenueOverviewResponse;
import com.ticket.servermono.ticketcontext.usecases.TicketServices;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller để quản lý các API liên quan đến phân tích doanh thu trong ticket context
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/tickets/analytics")
public class TicketAnalyticsController {
    
    private final TicketServices ticketServices;
    
    /**
     * Lấy tổng quan doanh thu của người tổ chức
     * 
     * @param principal Thông tin người dùng đăng nhập
     * @param fromStr Thời điểm bắt đầu phân tích (ISO-8601 format)
     * @param toStr Thời điểm kết thúc phân tích (ISO-8601 format)
     * @return Dữ liệu tổng quan doanh thu
     */
    @GetMapping("/revenue/overview")
    public ResponseEntity<?> getRevenueOverview(
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
            
            // Chuyển đổi sang LocalDateTime ở múi giờ của hệ thống
            ZoneId systemZone = ZoneId.systemDefault();
            LocalDateTime from = LocalDateTime.ofInstant(fromInstant, systemZone);
            LocalDateTime to = LocalDateTime.ofInstant(toInstant, systemZone);
            
            // Validate khoảng thời gian
            if (from.isAfter(to)) {
                return ResponseEntity.badRequest().body("Start date must be before end date");
            }            // Get the user ID from the principal
            String creatorId = principal.getName();
            log.info("Getting revenue overview from {} to {} for creator {}", from, to, creatorId);
            
            // Note: Currently we can't filter by creator since the OccaCreatorService 
            // doesn't have a proper implementation for getShowsByCreator. 
            // This will show all revenues grouped by occa name until the service is implemented.
            RevenueOverviewResponse response = ticketServices.getRevenueOverview(from, to, creatorId);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid date format", e);
            return ResponseEntity.badRequest()
                    .body("Invalid format. Dates must be in ISO-8601 format");
        } catch (Exception e) {
            log.error("Error getting revenue overview: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Lấy dữ liệu trendline số doanh thu theo ngày
     * 
     * @param principal Thông tin người dùng đăng nhập
     * @param from Thời điểm bắt đầu phân tích (ISO-8601 format)
     * @param to Thời điểm kết thúc phân tích (ISO-8601 format)
     * @return Danh sách số doanh thu theo ngày
     */
    @GetMapping("/revenue/trend")
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
            List<DailyRevenueItem> response = ticketServices.getTrendlineAnalytics(userId, from, to);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format or date format", e);
            return ResponseEntity.badRequest()
                    .body("Invalid format. User ID must be UUID and dates must be in ISO-8601 format");
        } catch (Exception e) {
            log.error("Error getting trendline analytics: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
        }
    }


}
