package com.ticket.servermono.occacontext.usecases;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ticket.servermono.occacontext.adapters.dtos.VenueResponse;
import com.ticket.servermono.occacontext.adapters.dtos.DetailData.LocationDataResponse;
import com.ticket.servermono.occacontext.infrastructure.repositories.VenueRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VenueServices {
    private final VenueRepository venueRepository;

    @Transactional(readOnly = true)
    public List<VenueResponse> getAllVenuesWithCount() {
        return venueRepository.findAllVenuesWithCount();
    }

    @Transactional(readOnly = true)
    public LocationDataResponse getLocationDetail(String occaId) {
    try {
        UUID occaUuid = UUID.fromString(occaId);
        return venueRepository.findLocationByOccaId(occaUuid)
                .orElseThrow(() -> new RuntimeException("Location not found"));
    } catch (IllegalArgumentException e) {
        throw new RuntimeException("Invalid occa ID format");
    }
}
}
