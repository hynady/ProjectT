// package com.ticket.servermono.ticketcontext.infrastructure.config;

// import java.time.LocalDate;
// import java.time.LocalDateTime;
// import java.time.LocalTime;
// import java.time.temporal.ChronoUnit;
// import java.util.ArrayList;
// import java.util.HashMap;
// import java.util.List;
// import java.util.Map;
// import java.util.Random;
// import java.util.UUID;

// import org.springframework.boot.CommandLineRunner;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.core.annotation.Order;

// import com.ticket.servermono.common.utils.SecurityUtils;
// import com.ticket.servermono.ticketcontext.adapters.dtos.BookingLockRequest;
// import com.ticket.servermono.ticketcontext.adapters.dtos.BookingLockResponse;
// import com.ticket.servermono.ticketcontext.adapters.dtos.BookingPayload;
// import com.ticket.servermono.ticketcontext.domain.enums.PaymentStatus;
// import com.ticket.servermono.ticketcontext.entities.Invoice;
// import com.ticket.servermono.ticketcontext.entities.TicketClass;
// import com.ticket.servermono.ticketcontext.infrastructure.repositories.InvoiceRepository;
// import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;
// import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketRepository;
// import com.ticket.servermono.ticketcontext.usecases.TicketServices;

// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;

// @Configuration
// @RequiredArgsConstructor
// @Slf4j
// public class TicketPurchaseDataInitializer {

//     @Bean
//     @Order(4) // Run after PaymentInfoDataInitializer which is Order(3)
//     CommandLineRunner initTicketPurchaseData(TicketRepository ticketRepository, 
//                                             TicketClassRepository ticketClassRepository,
//                                             InvoiceRepository invoiceRepository,
//                                             TicketServices ticketServices) {
//         return args -> {
//             log.info("Checking if ticket purchase data needs to be initialized...");
            
//             if (ticketRepository.count() <= 200) {
//                 log.info("Initializing ticket purchase data...");
                
//                 // Get all ticket classes
//                 List<TicketClass> ticketClasses = ticketClassRepository.findAll();
                
//                 // Get current user ID
//                 UUID userId = SecurityUtils.getCurrentUserId();
//                 log.info("Using user ID: {} for ticket purchases", userId);
                
//                 // Group ticket classes by showId to ensure purchase distribution meets requirements
//                 Map<UUID, List<TicketClass>> ticketClassesByShow = new HashMap<>();
//                 for (TicketClass ticketClass : ticketClasses) {
//                     if (ticketClass.getShowId() == null) {
//                         log.warn("Skipping ticket class without show ID: {}", ticketClass.getId());
//                         continue;
//                     }
                    
//                     ticketClassesByShow.computeIfAbsent(ticketClass.getShowId(), k -> new ArrayList<>()).add(ticketClass);
//                 }
                
//                 Random random = new Random();
//                 LocalDateTime now = LocalDateTime.now();
                
//                 // For each show, create enough purchases to reach >50% of capacity
//                 for (Map.Entry<UUID, List<TicketClass>> entry : ticketClassesByShow.entrySet()) {
//                     UUID showId = entry.getKey();
//                     List<TicketClass> classesForShow = entry.getValue();
                    
//                     // Calculate total capacity for this show
//                     int totalCapacity = 0;
//                     for (TicketClass tc : classesForShow) {
//                         totalCapacity += tc.getCapacity();
//                     }                    // Calculate how many tickets we need to sell to exceed 10% capacity
//                     int targetSales = (int) Math.ceil(totalCapacity * 0.1) + random.nextInt(5);
//                     int currentSoldCount = 0;
//                     int retryCount = 0;
//                     final int MAX_RETRIES = 10; // Avoid infinite loops
                    
//                     log.info("Show {}: Total capacity: {}, Target sales: {}", 
//                             showId, totalCapacity, targetSales);
//                       // Create purchases to reach the target
//                     while (currentSoldCount < targetSales && !classesForShow.isEmpty() && retryCount < MAX_RETRIES) {
//                         // Randomly select a ticket class for this purchase
//                         int classIndex = random.nextInt(classesForShow.size());
//                         TicketClass ticketClass = classesForShow.get(classIndex);
//                           // Generate a better purchase date distribution
//                         // 30% chance for very recent purchase (1-15 days ago)
//                         // 50% chance for medium-term purchase (16-45 days ago)
//                         // 20% chance for older purchase (46-90 days ago)
//                         int daysAgo;
//                         double chance = random.nextDouble();
//                         if (chance < 0.3) {
//                             daysAgo = random.nextInt(15) + 1; // 1-15 days ago
//                         } else if (chance < 0.8) {
//                             daysAgo = random.nextInt(30) + 16; // 16-45 days ago
//                         } else {
//                             daysAgo = random.nextInt(45) + 46; // 46-90 days ago
//                         }
//                         LocalDateTime purchaseDate = now.minus(daysAgo, ChronoUnit.DAYS);
//                           try {
//                             // Get the most up-to-date version of the ticket class to ensure accurate availability
//                             TicketClass updatedTicketClass = ticketClassRepository.findById(ticketClass.getId())
//                                     .orElseThrow(() -> new RuntimeException("Ticket class no longer exists: " + ticketClass.getId()));
//                               // Determine quantity for this purchase (1-4 tickets)
//                             int availableForClass = ticketServices.calculateAvailableTickets(updatedTicketClass);
//                             if (availableForClass <= 0) {
//                                 // This class is sold out, remove it from the list
//                                 log.info("Ticket class {} is sold out, removing from available classes", updatedTicketClass.getName());
//                                 classesForShow.remove(classIndex);
//                                 continue;
//                             }
//                               // Buy 1-4 tickets, but not more than what's available
//                             // or what's needed to reach our target
//                             int maxPurchase = Math.min(4, Math.min(availableForClass, targetSales - currentSoldCount));
//                             if (maxPurchase <= 0) {
//                                 log.info("No tickets available to purchase for class {}, removing it", updatedTicketClass.getName());
//                                 classesForShow.remove(classIndex);
//                                 continue;
//                             }
//                             int quantity = random.nextInt(maxPurchase) + 1;

//                             // Create booking request
//                             BookingLockRequest lockRequest = createBookingRequest(updatedTicketClass, quantity);
//                               log.info("Attempting to lock {} tickets for class {} (available: {})", 
//                                     quantity, updatedTicketClass.getName(), availableForClass);
                            
//                             // Lock tickets
//                             BookingLockResponse lockResponse = ticketServices.lockTicketsForBooking(lockRequest);
//                             log.info("Successfully locked {} tickets for class {} with paymentId: {}", 
//                                     quantity, updatedTicketClass.getName(), lockResponse.getPaymentId());
//                               // Find and update the invoice
//                             Invoice invoice = invoiceRepository.findByPaymentId(lockResponse.getPaymentId())
//                                     .orElseThrow(() -> new RuntimeException("Invoice not found for paymentId: " + lockResponse.getPaymentId()));
                            
//                             // Update invoice with userId and backdated creation time
//                             invoice.setUserId(userId);
//                             invoice.setCreatedAt(purchaseDate); // Ngày trong quá khứ chỉ áp dụng cho hóa đơn
                            
//                             // Update status to PAYMENT_SUCCESS (simulating payment)
//                             invoice.setStatus(PaymentStatus.PAYMENT_SUCCESS);
//                             invoiceRepository.save(invoice);
//                               // Create booking payload from lock request
//                             BookingPayload bookingPayload = createBookingPayload(updatedTicketClass.getShowId(), lockRequest);
//                               try {                                // Book tickets - lưu ý vé sẽ luôn có ngày là hiện tại, không phụ thuộc vào ngày của invoice
//                                 // Pass the invoice to the bookTicket method through the userId parameter (it's used internally)
//                                 ticketServices.bookTicket(bookingPayload, userId);
//                                 log.info("Successfully booked {} tickets for class {} (invoice date: {}, actual ticket date: current date)", 
//                                         quantity, ticketClass.getName(), purchaseDate);
                                
//                                 // Update our count of sold tickets
//                                 currentSoldCount += quantity;
                                
//                             } catch (Exception e) {
//                                 log.error("Error booking tickets after locking: {}", e.getMessage(), e);
//                                 // If booking fails, try to continue with other tickets
//                             }
//                               } catch (Exception e) {
//                             log.error("Error creating ticket purchase: {}", e.getMessage(), e);
                            
//                             // If the error is due to no available tickets, remove this class from options
//                             if (e.getMessage() != null && e.getMessage().contains("Vé đã hết hoặc đã được đặt bởi người khác")) {
//                                 log.warn("Removing ticket class {} from options due to unavailability", ticketClass.getName());
//                                 classesForShow.remove(classIndex);
                                
//                                 // Refresh data for this ticket class from the repository to get latest state
//                                 ticketClassRepository.findById(ticketClass.getId()).ifPresent(refreshed -> {
//                                     for (int i = 0; i < classesForShow.size(); i++) {
//                                         if (classesForShow.get(i).getId().equals(refreshed.getId())) {
//                                             classesForShow.set(i, refreshed);
//                                             break;
//                                         }
//                                     }
//                                 });
//                             }
//                               // Add a delay before trying again to avoid overwhelming the system
//                             try {
//                                 Thread.sleep(100);
//                             } catch (InterruptedException ie) {
//                                 Thread.currentThread().interrupt();
//                             }
                            
//                             // Increment retry count to avoid infinite loops
//                             retryCount++;
//                         }
//                     }
//                       // Log final fill rate for this show
//                     int finalSoldCount = 0;
//                     for (TicketClass tc : entry.getValue()) {
//                         Long sold = ticketRepository.countByTicketClassIdAndEndUserIdIsNotNull(tc.getId());
//                         finalSoldCount += sold;
//                     }
                    
//                     double fillRate = (double) finalSoldCount / totalCapacity * 100;
//                     log.info("Show {}: Final sold count: {}, Fill rate: {:.1f}%", 
//                            showId, finalSoldCount, fillRate);
                    
//                     if (retryCount >= MAX_RETRIES) {
//                         log.warn("Max retry attempts reached for show {}. Target sales: {}, Actual sales: {}", 
//                                 showId, targetSales, currentSoldCount);
//                     }
//                 }
                
//                 log.info("Ticket purchase data initialization completed.");
//             } else {
//                 log.info("Tickets already exist, skipping purchase initialization.");
//             }
//         };
//     }
    
//     /**
//      * Create booking lock request for ticket class
//      */
//     private BookingLockRequest createBookingRequest(TicketClass ticketClass, int quantity) {
//         List<BookingLockRequest.TicketItem> tickets = new ArrayList<>();
        
//         BookingLockRequest.TicketItem ticketItem = new BookingLockRequest.TicketItem();
//         ticketItem.setId(ticketClass.getId().toString());
//         ticketItem.setType(ticketClass.getName());
//         ticketItem.setQuantity(quantity);
//         tickets.add(ticketItem);
        
//         BookingLockRequest.Recipient recipient = new BookingLockRequest.Recipient();
//         recipient.setId(SecurityUtils.getCurrentUserId().toString());
//         recipient.setName("Test User");
//         recipient.setEmail("testuser@example.com");
//         recipient.setPhoneNumber("0123456789");
        
//         return BookingLockRequest.builder()
//                 .showId(ticketClass.getShowId().toString())
//                 .tickets(tickets)
//                 .recipient(recipient)
//                 .build();
//     }
    
//     /**
//      * Create booking payload from booking lock request
//      */
//     private BookingPayload createBookingPayload(UUID showId, BookingLockRequest request) {
//         List<BookingPayload.TicketPayload> tickets = new ArrayList<>();
        
//         for (BookingLockRequest.TicketItem item : request.getTickets()) {
//             BookingPayload.TicketPayload ticketPayload = BookingPayload.TicketPayload.builder()
//                     .id(UUID.fromString(item.getId()))
//                     .type(item.getType())
//                     .quantity(item.getQuantity())
//                     .build();
//             tickets.add(ticketPayload);
//         }
        
//         return BookingPayload.builder()
//                 .showId(showId)
//                 .tickets(tickets)
//                 .build();
//     }
// }
