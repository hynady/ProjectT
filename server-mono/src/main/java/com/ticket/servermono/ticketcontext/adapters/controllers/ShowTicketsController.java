package com.ticket.servermono.ticketcontext.adapters.controllers;

import java.security.Principal;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.ticketcontext.adapters.dtos.PaginatedTicketsResponse;
import com.ticket.servermono.ticketcontext.adapters.dtos.PaginatedTicketsWithRevenueResponse;
import com.ticket.servermono.ticketcontext.adapters.dtos.TicketWithRecipientInfoResponse;
import com.ticket.servermono.ticketcontext.adapters.dtos.TicketsWithRevenueResponse;
import com.ticket.servermono.ticketcontext.usecases.TicketServices;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/shows")
public class ShowTicketsController {
    
    private final TicketServices ticketServices;
    
    /**
     * Lấy danh sách vé kèm thông tin người nhận theo invoice của một show.
     * Endpoint này dùng Principal để xác thực
     * 
     * @param showId ID của show
     * @param principal Thông tin người dùng đăng nhập
     * @param page Số trang (mặc định: 0)
     * @param size Số phần tử mỗi trang (mặc định: 10)
     * @param sort Trường để sắp xếp (enum: "purchasedAt", "recipientName")
     * @param direction Hướng sắp xếp (enum: "asc", "desc", mặc định: "desc")
     * @return Danh sách vé đã phân trang
     */
    @GetMapping("/{showId}/tickets")
    public ResponseEntity<?> getShowTicketsWithRecipientInfo(
            @PathVariable String showId,
            @Nullable Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        
        if (principal == null) {
            log.error("No authenticated user found");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }

        try {
            UUID showUuid = UUID.fromString(showId);
            UUID userId = UUID.fromString(principal.getName());
              log.info("Getting tickets for show={} with page={}, size={}, sort={}, direction={}, userId={}",
                    showId, page, size, sort, direction, principal.getName());
            
            TicketsWithRevenueResponse ticketsWithRevenue = ticketServices.getShowTicketsWithRecipientInfoByPrincipal(
                    showUuid, userId, page, size, sort, direction);
                    
            PaginatedTicketsWithRevenueResponse response = PaginatedTicketsWithRevenueResponse.fromTicketsWithRevenue(ticketsWithRevenue);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format: showId={}, error={}", showId, e.getMessage());
            return ResponseEntity.badRequest().body("Invalid UUID format");
        } catch (SecurityException e) {
            log.warn("Unauthorized access attempt to tickets for show {}: {}", showId, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (EntityNotFoundException e) {
            log.warn("Not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting tickets for show {}: {}", showId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
        }
    }
      /**
     * Lấy danh sách vé kèm thông tin người nhận theo invoice của một show.
     * Endpoint này dùng AuthCode để xác thực
     * 
     * @param authCode Mã xác thực của show
     * @param page Số trang (mặc định: 0)
     * @param size Số phần tử mỗi trang (mặc định: 10)
     * @param sort Trường để sắp xếp (enum: "purchasedAt", "recipientName")
     * @param direction Hướng sắp xếp (enum: "asc", "desc", mặc định: "desc")
     * @return Danh sách vé đã phân trang
     */
    @GetMapping("/tickets/by-auth-code")
    public ResponseEntity<?> getShowTicketsWithRecipientInfoByAuthCode(
            @RequestParam(required = true) String authCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "desc") String direction) {
          try {
            log.info("Getting tickets by auth code with page={}, size={}, sort={}, direction={}",
                    page, size, sort, direction);
            
            TicketsWithRevenueResponse ticketsWithRevenue = ticketServices.getShowTicketsWithRecipientInfoByAuthCode(
                    authCode, page, size, sort, direction);
                    
            PaginatedTicketsWithRevenueResponse response = PaginatedTicketsWithRevenueResponse.fromTicketsWithRevenue(ticketsWithRevenue);
            
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            log.warn("Invalid auth code: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid authentication code");
        } catch (EntityNotFoundException e) {
            log.warn("Not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting tickets with auth code: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
        }
    }
}
