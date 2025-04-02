package com.ticket.servermono.ticketcontext.adapters.controllers;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.ticketcontext.adapters.dtos.AddTicketClassRequest;
import com.ticket.servermono.ticketcontext.adapters.dtos.TicketClassResponse;
import com.ticket.servermono.ticketcontext.usecases.TicketServices;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1")
public class TicketClassController {
    
    private final TicketServices ticketServices;
    
    /**
     * Add a new ticket class to a show
     * Endpoint: POST /organize/occas/{occaId}/shows/{showId}/tickets
     */
    @PostMapping("/organize/occas/{occaId}/shows/{showId}/tickets")
    public ResponseEntity<TicketClassResponse> addTicketClass(
            @PathVariable String occaId, 
            @PathVariable String showId,
            @RequestBody AddTicketClassRequest request) {
        try {
            log.info("Adding new ticket class for show: {}, type: {}, price: {}, capacity: {}", 
                    showId, request.getType(), request.getPrice(), request.getAvailableQuantity());
            
            // We don't need to check occaId as per requirements
            TicketClassResponse response = ticketServices.addTicketClass(
                    UUID.fromString(showId), 
                    request);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error adding ticket class: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update an existing ticket class
     * Endpoint: PUT /organize/occas/{occaId}/shows/{showId}/tickets/{ticketId}
     */
    @PutMapping("/organize/occas/{occaId}/shows/{showId}/tickets/{ticketId}")
    public ResponseEntity<TicketClassResponse> updateTicketClass(
            @PathVariable String occaId, 
            @PathVariable String showId,
            @PathVariable String ticketId,
            @RequestBody AddTicketClassRequest request) {
        try {
            log.info("Updating ticket class with ID: {}, type: {}, price: {}, capacity: {}", 
                    ticketId, request.getType(), request.getPrice(), request.getAvailableQuantity());
            
            // We don't need to check occaId as per implementation
            TicketClassResponse response = ticketServices.updateTicketClass(
                    UUID.fromString(ticketId), 
                    request);
            
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            log.error("Ticket class not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating ticket class: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Delete a ticket class
     * Endpoint: DELETE /organize/occas/{occaId}/shows/{showId}/tickets/{ticketId}
     */
    @DeleteMapping("/organize/occas/{occaId}/shows/{showId}/tickets/{ticketId}")
    public ResponseEntity<Void> deleteTicketClass(
            @PathVariable String occaId, 
            @PathVariable String showId,
            @PathVariable String ticketId) {
        try {
            log.info("Deleting ticket class with ID: {}", ticketId);
            
            // We don't verify occaId or showId as per requirements
            ticketServices.deleteTicketClass(UUID.fromString(ticketId));
            
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            log.error("Ticket class not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            log.error("Cannot delete ticket class: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            log.error("Error deleting ticket class: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
}