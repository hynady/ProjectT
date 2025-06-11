// package com.ticket.servermono.ticketcontext.infrastructure.config;

// import java.time.LocalDateTime;
// import java.util.HashMap;
// import java.util.Map;
// import java.util.UUID;

// import org.springframework.stereotype.Component;

// import com.ticket.servermono.ticketcontext.domain.enums.PaymentStatus;
// import com.ticket.servermono.ticketcontext.entities.Invoice;
// import com.ticket.servermono.ticketcontext.entities.TicketClass;
// import com.ticket.servermono.ticketcontext.infrastructure.repositories.InvoiceRepository;
// import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;
// import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketRepository;
// import com.ticket.servermono.ticketcontext.usecases.TicketServices;

// import lombok.RequiredArgsConstructor;

// @Component
// @RequiredArgsConstructor
// public class TicketDataInitializer {
//     private final TicketRepository ticketRepository;
//     private final TicketServices ticketServices;
//     private final TicketClassRepository ticketClassRepository;
//     private final InvoiceRepository invoiceRepository;

//     public void initializeTickets() {
//         // Check if there are no tickets, then initialize random 2-4 tickets each ticket class through function sellTicket in TicketService
//         if (ticketRepository.count() == 0) {
//             ticketClassRepository.findAll().forEach(ticketClass -> {
//                 int ticketCount = (int) (Math.random() * (4 - 2 + 1)) + 2;
                
//                 // Create a invoice for this batch of tickets
//                 Invoice invoice = createInvoiceForTickets(ticketClass, ticketCount);
//                 invoiceRepository.save(invoice);
                
//                 // Create tickets with invoice association
//                 for (int i = 0; i < ticketCount; i++) {
//                     ticketServices.sellTicket(ticketClass.getId(), invoice);
//                 }
//             });
//         }
//     }
    
//     /**
//      * Create an invoice for a batch of tickets
//      * @param ticketClass The ticket class
//      * @param quantity Number of tickets
//      * @return A new Invoice entity
//      */
//     private Invoice createInvoiceForTickets(TicketClass ticketClass, int quantity) {
//         double totalAmount = ticketClass.getPrice() * quantity;
        
//         Map<String, Integer> ticketDetails = new HashMap<>();
//         ticketDetails.put(ticketClass.getId().toString(), quantity);
        
//         return Invoice.builder()
//                 .soTien(totalAmount)
//                 .noiDung("Initial data - " + ticketClass.getName() + " x" + quantity)
//                 .status(PaymentStatus.PAYMENT_SUCCESS)
//                 .paymentId("INIT_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8))
//                 .showId(ticketClass.getShowId())
//                 .createdAt(LocalDateTime.now())
//                 .ticketDetails(ticketDetails)
//                 .build();
//     }
// }