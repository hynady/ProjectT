package com.ticket.servermono.ticketcontext.infrastructure.config;

import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.ShowRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TicketClassDataInitializer {

    private final TicketClassRepository ticketClassRepository;
    private final ShowRepository showRepository;
    private final TicketDataInitializer ticketDataInitializer;

    // List of names for ticket classes
    private final List<String> names = List.of("Đồng", "Bạc", "Vàng", "Kim cương", "VIP", "Super VIP", "Đỉnh nóc",
            "Cao cấp", "Thượng hạng", "Thượng đẳng");

    @Transactional
    public void initializeTickets() {
        // check all ticket class initialize 1-4 ticket classes each show(which no ticket class) with random prices and names
        showRepository.findAll().forEach(show -> {
            // Check if show has ticket classes
            if (show.getTicketClasses().size() > 0) {
                return;
            }
            int numTicketClasses = (int) (Math.random() * 4) + 1;
            for (int i = 0; i < numTicketClasses; i++) {
                TicketClass ticketClass = TicketClass.builder()
                        // Random name with Name list available
                        .name(names.get((int) (Math.random() * names.size())))
                        .price(Math.round(Math.random() * 1000000 * 100.0) / 100.0)
                        .capacity((int) (Math.random() * 100))
                        .show(show)
                        .build();
                ticketClassRepository.save(ticketClass);
            }
        });
        ticketDataInitializer.initializeTickets();
    }
}