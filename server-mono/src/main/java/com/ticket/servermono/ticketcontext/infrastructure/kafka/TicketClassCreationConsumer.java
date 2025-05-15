package com.ticket.servermono.ticketcontext.infrastructure.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.servermono.ticketcontext.adapters.dtos.TicketClassCreateDTO;
import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class TicketClassCreationConsumer {

    private final TicketClassRepository ticketClassRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    @KafkaListener(topics = "cascade-delete-show")
    public void handleCascadeDeleteShow(String message) {
        try {
            log.info("Received message to cascade delete ticket classes for show: {}", message);
            
            // Deserialize message to UUID
            UUID showId = UUID.fromString(message);
            
            // Xóa tất cả ticket class liên quan đến show
            ticketClassRepository.deleteAllByShowId(showId);
            log.info("Deleted all ticket classes for show with ID: {}", showId);
        } catch (Exception e) {
            log.error("Error processing cascade delete show: {}", e.getMessage(), e);
        }
    }

    @Transactional
    @KafkaListener(topics = "ticket-class-create", groupId = "ticket-service")
    public void handleTicketClassCreation(String message) {
        try {
            log.info("Received message to create/update ticket class: {}", message);
            
            // Deserialize message to DTO
            TicketClassCreateDTO dto = objectMapper.readValue(message, TicketClassCreateDTO.class);
            
            // Kiểm tra xem có ID được gửi kèm không
            if (dto.getId() != null) {
                // Tìm ticket class hiện có theo ID
                Optional<TicketClass> existingTicketClass = ticketClassRepository.findById(dto.getId());
                
                if (existingTicketClass.isPresent()) {
                    // Cập nhật ticket class hiện có
                    TicketClass ticketClass = existingTicketClass.get();
                    ticketClass.setName(dto.getType());
                    ticketClass.setPrice(dto.getPrice());
                    ticketClass.setCapacity(dto.getAvailableQuantity());
                    
                    // Lưu cập nhật
                    ticketClass = ticketClassRepository.save(ticketClass);
                    log.info("Updated existing ticket class with ID: {} for show: {}", 
                            ticketClass.getId(), ticketClass.getShowId());
                    return;
                }
                // Nếu không tìm thấy với ID cụ thể, tiếp tục tạo mới (fall through)
                log.warn("Could not find ticket class with ID: {}. Creating new one.", dto.getId());
            }
            
            // Check existing ticket class by show ID and name
            Optional<TicketClass> existingByShowAndName = ticketClassRepository.findByShowIdAndName(
                    dto.getShowId(), dto.getType());
            
            if (existingByShowAndName.isPresent()) {
                // Update existing ticket class by show ID and name
                TicketClass ticketClass = existingByShowAndName.get();
                ticketClass.setPrice(dto.getPrice());
                ticketClass.setCapacity(dto.getAvailableQuantity());
                
                // Save updates
                ticketClass = ticketClassRepository.save(ticketClass);
                log.info("Updated existing ticket class by show and name, ID: {} for show: {}", 
                        ticketClass.getId(), ticketClass.getShowId());
            } else {
                // Create new TicketClass entity
                TicketClass ticketClass = TicketClass.builder()
                        .name(dto.getType())
                        .price(dto.getPrice())
                        .capacity(dto.getAvailableQuantity())
                        .showId(dto.getShowId())
                        .build();
                
                // Save to database
                ticketClass = ticketClassRepository.save(ticketClass);
                log.info("Successfully created new ticket class with ID: {} for show: {}", 
                        ticketClass.getId(), ticketClass.getShowId());
            }
        } catch (Exception e) {
            log.error("Error processing ticket class creation/update: {}", e.getMessage(), e);
        }
    }

    @Transactional
    @KafkaListener(topics = "ticket-class-update", groupId = "ticket-service")
    public void handleTicketClassUpdate(String message) {
        try {
            log.info("Received message to update ticket class: {}", message);
            
            // Deserialize message to DTO
            TicketClassCreateDTO dto = objectMapper.readValue(message, TicketClassCreateDTO.class);
            
            // Kiểm tra xem có ID được gửi kèm không
            if (dto.getId() != null) {
                // Tìm ticket class hiện có theo ID
                Optional<TicketClass> existingTicketClass = ticketClassRepository.findById(dto.getId());
                
                if (existingTicketClass.isPresent()) {
                    // Cập nhật ticket class hiện có
                    TicketClass ticketClass = existingTicketClass.get();
                    
                    // Lưu giá trị cũ để log
                    String oldName = ticketClass.getName();
                    double oldPrice = ticketClass.getPrice();
                    int oldCapacity = ticketClass.getCapacity();
                    
                    // Cập nhật các giá trị mới
                    ticketClass.setName(dto.getType());
                    ticketClass.setPrice(dto.getPrice());
                    ticketClass.setCapacity(dto.getAvailableQuantity());
                    
                    // Lưu thực thể và đảm bảo nó được flush ngay lập tức
                    ticketClass = ticketClassRepository.saveAndFlush(ticketClass);
                    
                    log.info("Updated existing ticket class with ID: {}, changes: name [{}->{}], price [{}->{}], capacity [{}->{}]", 
                            ticketClass.getId(), oldName, ticketClass.getName(), 
                            oldPrice, ticketClass.getPrice(),
                            oldCapacity, ticketClass.getCapacity());
                    return;
                }
                // Nếu không tìm thấy với ID cụ thể, tiếp tục tìm theo showId và name (fall through)
                log.warn("Could not find ticket class with ID: {}. Falling back to search by show and name.", dto.getId());
            }
            
            // Find existing ticket classes for this show by showId and name
            Optional<TicketClass> existingClass = ticketClassRepository.findByShowIdAndName(
                    dto.getShowId(), dto.getType());
            
            if (existingClass.isPresent()) {
                // Update existing ticket class
                TicketClass ticketClass = existingClass.get();
                
                // Lưu giá trị cũ để log
                double oldPrice = ticketClass.getPrice();
                int oldCapacity = ticketClass.getCapacity();
                
                // Cập nhật giá trị mới
                ticketClass.setName(dto.getType());
                ticketClass.setPrice(dto.getPrice());
                ticketClass.setCapacity(dto.getAvailableQuantity());
                
                // Save and flush immediately
                ticketClass = ticketClassRepository.saveAndFlush(ticketClass);
                
                log.info("Successfully updated ticket class with ID: {} for show: {}, changes: price [{}->{}], capacity [{}->{}]", 
                        ticketClass.getId(), ticketClass.getShowId(),
                        oldPrice, ticketClass.getPrice(),
                        oldCapacity, ticketClass.getCapacity());
            } else {
                // Create new ticket class if it doesn't exist
                TicketClass ticketClass = TicketClass.builder()
                        .name(dto.getType())
                        .price(dto.getPrice())
                        .capacity(dto.getAvailableQuantity())
                        .showId(dto.getShowId())
                        .build();
                
                // Save to database
                ticketClass = ticketClassRepository.saveAndFlush(ticketClass);
                log.info("Created new ticket class with ID: {} for show: {} during update operation", 
                        ticketClass.getId(), ticketClass.getShowId());
            }
            
        } catch (Exception e) {
            log.error("Error processing ticket class update: {}", e.getMessage(), e);
        }
    }
}