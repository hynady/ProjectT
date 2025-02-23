package com.ticket.servermono.occacontext.adapters.controllers;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.occacontext.adapters.dtos.Booking.OccaForBookingResponse;
import com.ticket.servermono.occacontext.usecases.OccaServices;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/occa")
public class OccaBookingController {
    
    private final OccaServices occaServices;

    // Get occasion for booking
    @GetMapping("forbooking/{occaId}")
public ResponseEntity<?> getOccaForBooking(@PathVariable String occaId) {
    try {
        UUID uuid = UUID.fromString(occaId);
        OccaForBookingResponse occa = occaServices.getOccaForBooking(uuid);
        return ResponseEntity.ok(occa);
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body("Invalid ID format: " + e.getMessage());
    } catch (RuntimeException e) {
        return ResponseEntity.notFound().build();
    } catch (Exception e) {
        return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
    }
}

}
