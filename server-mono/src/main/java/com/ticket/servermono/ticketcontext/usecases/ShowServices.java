package com.ticket.servermono.ticketcontext.usecases;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ticket.servermono.ticketcontext.adapters.dtos.OccaShowDataResponse;
import com.ticket.servermono.ticketcontext.adapters.dtos.OccaShowDataResponse.PriceInfo;
import com.ticket.servermono.ticketcontext.entities.Show;
import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.ShowRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShowServices {
    private final ShowRepository showRepository;
    private final TicketRepository ticketRepository;

    public List<OccaShowDataResponse> getShowsByOccaId(UUID occaId) {
        List<Show> shows = showRepository.findByOccaId(occaId);
        if (shows.isEmpty()) {
            throw new EntityNotFoundException("No shows found for occasion: " + occaId);
        }

        return shows.stream()
                .map(show -> {
                    OccaShowDataResponse response = new OccaShowDataResponse();
                    // Direct mapping since Show entity stores date and time as strings
                    response.setId(show.getId());
                    response.setDate(show.getDate());
                    response.setTime(show.getTime());

                    // Get ticket prices and availability for this show
                    List<PriceInfo> prices = getTicketClassesForShow(show.getId());
                    response.setPrices(prices);

                    return response;
                })
                .collect(Collectors.toList());
    }

    private List<PriceInfo> getTicketClassesForShow(UUID showId) {
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new EntityNotFoundException("Show not found"));

        return show.getTicketClasses().stream()
                .map(ticketClass -> {
                    PriceInfo priceInfo = new PriceInfo();
                    priceInfo.setId(ticketClass.getId());
                    priceInfo.setType(ticketClass.getName());
                    priceInfo.setPrice(ticketClass.getPrice());
                    
                    priceInfo.setAvailable(calculateAvailableTickets(ticketClass));

                    return priceInfo;
                })
                .collect(Collectors.toList());
    }

    private int calculateAvailableTickets(TicketClass ticketClass) {
        Long soldTickets = ticketRepository.countByTicketClassId(ticketClass.getId());
        return ticketClass.getCapacity() - soldTickets.intValue();
    }

    boolean isSoldOut(TicketClass ticketClass) {
        return calculateAvailableTickets(ticketClass) == 0;
    }

}
