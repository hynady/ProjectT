package com.ticket.servermono.trackingcontext.adapters.controllers;

import com.ticket.servermono.trackingcontext.adapters.dtos.TrackingRequest;
import com.ticket.servermono.trackingcontext.adapters.dtos.TrackingResponse;
import com.ticket.servermono.trackingcontext.usecases.TrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("v1/tracking")
@RequiredArgsConstructor
public class TrackingController {
    
    private final TrackingService trackingService;
    
    @PostMapping
    public ResponseEntity<TrackingResponse> receiveTracking(
            @RequestBody TrackingRequest trackingRequest,
            @Nullable Principal principal) {
            
        // Kiểm tra xem có người dùng đăng nhập không
        if (principal == null) {
            // For top occas, we still process tracking data even without a user
            if (trackingRequest.getTopOccas() != null && !trackingRequest.getTopOccas().isEmpty()) {
                trackingService.processAnonymousTracking(trackingRequest);
                return ResponseEntity.ok(new TrackingResponse(true, "Anonymous tracking data processed successfully"));
            }
            return ResponseEntity.status(401).body(new TrackingResponse(false, "Unauthorized"));
        }
        
        // Lấy userId từ principal name
        String userId = principal.getName();
        
        try {
            trackingService.processUserTracking(userId, trackingRequest);
            return ResponseEntity.ok(new TrackingResponse(true, "Tracking data processed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new TrackingResponse(false, e.getMessage()));
        }
    }
}
