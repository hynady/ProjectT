package com.ticket.servermono.occacontext.adapters.controllers;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.occacontext.adapters.dtos.organizer.CreateOccaRequest;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.CreateOccaResponse;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.OrganizerOccaUnit;
import com.ticket.servermono.occacontext.usecases.OrganizerServices;

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
     * @param request Thông tin để tạo sự kiện mới
     * @return ResponseEntity<CreateOccaResponse> Thông tin sự kiện đã tạo
     */
    @PostMapping("/occas")
    public ResponseEntity<CreateOccaResponse> createOcca(@RequestBody CreateOccaRequest request) {
        log.info("Creating new occa with title: {}", 
                request.getBasicInfo() != null ? request.getBasicInfo().getTitle() : "unknown");
        
        try {
            CreateOccaResponse response = organizerServices.createOcca(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating occa", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}