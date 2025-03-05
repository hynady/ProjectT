package com.ticket.servermono.occacontext.usecases;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.ticket.servermono.occacontext.adapters.dtos.Show.OccaShowDataResponse;
import com.ticket.servermono.occacontext.adapters.dtos.Show.OccaShowDataResponse.PriceInfo;
import com.ticket.servermono.occacontext.entities.Show;
import com.ticket.servermono.occacontext.infrastructure.repositories.ShowRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import ticket.TicketShowServicesGrpc.TicketShowServicesBlockingStub;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShowServices {
    private final ShowRepository showRepository;

    private final KafkaTemplate<String, String> kafkaTemplate;

    private final String CLASS_INIT = "ticket_class_init";

    @GrpcClient("ticket-service")
    private TicketShowServicesBlockingStub ticketShowStub;

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
        try {
            showRepository.findById(showId)
                    .orElseThrow(() -> new EntityNotFoundException("Show not found"));

            ticket.TicketShowResponse response = ticketShowStub.getTicketClassesByShowId(
                    ticket.TicketShowRequest.newBuilder()
                            .setShowId(showId.toString())
                            .build());

            return response.getTicketClassesList().stream()
                    .map(ticketClass -> {
                        PriceInfo priceInfo = new PriceInfo();
                        priceInfo.setId(UUID.fromString(ticketClass.getId()));
                        priceInfo.setType(ticketClass.getName());
                        priceInfo.setPrice(ticketClass.getPrice());
                        priceInfo.setAvailable(ticketClass.getAvailable());
                        return priceInfo;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to get ticket classes for show: " + showId, e);
            throw new RuntimeException("Failed to get ticket classes for show: " + showId);
        }
    }

    public void initializeTicketClasses(UUID showId) {

        kafkaTemplate.send(CLASS_INIT, showId.toString());
    }
    
}
