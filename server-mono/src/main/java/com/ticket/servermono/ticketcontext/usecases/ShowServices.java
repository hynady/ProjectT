package com.ticket.servermono.ticketcontext.usecases;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.ticket.servermono.ticketcontext.adapters.dtos.OccaShowDataResponse;
import com.ticket.servermono.ticketcontext.adapters.dtos.OccaShowDataResponse.PriceInfo;
import com.ticket.servermono.ticketcontext.entities.Show;
import com.ticket.servermono.ticketcontext.entities.TicketClass;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.ShowRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketClassRepository;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.TicketRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShowServices {
    private final ShowRepository showRepository;
    private final TicketRepository ticketRepository;
    private final TicketClassRepository ticketClassRepository;

    private final String OCCA_CREATION = "occa_creation";

    public Integer calculateAvailableTickets(UUID showId) {
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new EntityNotFoundException("Show not found"));

        Integer totalSeats = show.getNumberOfSeats();
        Long soldTickets = ticketRepository.countByShowId(showId);

        return totalSeats - soldTickets.intValue();
    }

    public List<OccaShowDataResponse> getShowsByOccaId(UUID occaId) {
        List<Show> shows = showRepository.findByOccaId(occaId);
        if (shows.isEmpty()) {
            throw new EntityNotFoundException("No shows found for occasion: " + occaId);
        }

        return shows.stream()
                .map(show -> {
                    OccaShowDataResponse response = new OccaShowDataResponse();
                    // Direct mapping since Show entity stores date and time as strings
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
        List<TicketClass> ticketClasses = ticketClassRepository.findByShowId(showId);

        return ticketClasses.stream()
                .map(ticketClass -> {
                    PriceInfo priceInfo = new PriceInfo();
                    priceInfo.setType(ticketClass.getName());
                    priceInfo.setPrice(ticketClass.getPrice());

                    // Calculate available tickets for this class and show
                    Integer available = calculateAvailableTickets(showId);
                    priceInfo.setAvailable(available);

                    return priceInfo;
                })
                .collect(Collectors.toList());
    }

    @KafkaListener(topics = OCCA_CREATION)
    public void createShow(Map<String, Object> message) {
        try {
            Show show = Show.builder()
                .date(message.get("date").toString())
                .time(message.get("time").toString())
                .numberOfSeats((Integer) message.get("numberOfSeats"))
                .occaId(UUID.fromString(message.get("occaId").toString()))
                .build();
            showRepository.save(show);
        } catch (Exception e) {
            throw new RuntimeException("Failed to process message", e);
        }
    }
}
