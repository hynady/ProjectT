// package com.ticket.servermono.ticketcontext.infrastructure.config;

// import java.util.List;
// import java.util.UUID;

// import org.springframework.kafka.annotation.KafkaListener;
// import org.springframework.stereotype.Component;
// import org.springframework.transaction.annotation.Transactional;

// import com.ticket.servermono.occacontext.infrastructure.repositories.ShowRepository;
// import com.ticket.servermono.ticketcontext.entities.TicketClass;
// import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;

// import jakarta.persistence.EntityNotFoundException;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;

// @Component
// @RequiredArgsConstructor
// @Slf4j
// public class TicketClassDataInitializer {

//     private final TicketClassRepository ticketClassRepository;
//     private final ShowRepository showRepository;
//     private final TicketDataInitializer ticketDataInitializer;

//     // List of names for ticket classes
//     private final List<String> names = List.of("Đồng", "Bạc", "Vàng", "Kim cương", "VIP", "Super VIP", "Đỉnh nóc",
//             "Cao cấp", "Thượng hạng", "Thượng đẳng");

//     @Transactional
//     @KafkaListener(topics = "ticket_class_init", groupId = "ticket-service")
//     public void initializeTicketClasses(String showId) {
//         log.info("Received Kafka message to initialize ticket classes for show: {}", showId);
        
//         try {
//             UUID showUuid = UUID.fromString(showId);
            
//             // Tìm show theo ID từ message Kafka
//             showRepository.findById(showUuid)
//                 .orElseThrow(() -> new EntityNotFoundException("Show not found with ID: " + showId));
            
//             // Kiểm tra xem show đã có ticket class chưa
//             long existingTicketClasses = ticketClassRepository.countByShowId(showUuid);
            
//             if (existingTicketClasses > 0) {
//                 log.info("Show {} already has {} ticket classes, skipping initialization", showId, existingTicketClasses);
//                 return;
//             }
            
//             // Tạo ngẫu nhiên 1-4 ticket classes cho show
//             int numTicketClasses = (int) (Math.random() * 4) + 1;
//             log.info("Creating {} ticket classes for show {}", numTicketClasses, showId);
            
//             for (int i = 0; i < numTicketClasses; i++) {
//                 String name = names.get((int) (Math.random() * names.size()));
//                 Double price = Double.valueOf(Math.round(Math.random() * 1000000 * 100.0) / 100.0);
//                 int capacity = (int) (Math.random() * 100) + 50; // Tối thiểu 50 vé
                
//                 TicketClass ticketClass = TicketClass.builder()
//                         .name(name)
//                         .price(price)
//                         .capacity(capacity)
//                         .showId(showUuid)
//                         .build();
                
//                 ticketClassRepository.save(ticketClass);
//                 log.info("Created ticket class: {} with price {} and capacity {} for show {}", 
//                          name, price, capacity, showId);
//             }
            
//             // Khởi tạo tickets mẫu nếu cần
//             boolean shouldInitializeTickets = false; // Điều chỉnh logic này tùy vào yêu cầu
//             if (shouldInitializeTickets) {
//                 ticketDataInitializer.initializeTickets();
//             }
            
//             log.info("Successfully initialized ticket classes for show {}", showId);
//         } catch (Exception e) {
//             log.error("Error initializing ticket classes for show {}: {}", showId, e.getMessage(), e);
//         }
//     }
// }