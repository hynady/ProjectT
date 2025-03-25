package com.ticket.servermono.occacontext.usecases;

import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;

import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ticket.servermono.occacontext.adapters.dtos.VenueResponse;
import com.ticket.servermono.occacontext.adapters.dtos.DetailData.LocationDataResponse;
import com.ticket.servermono.occacontext.entities.Region;
import com.ticket.servermono.occacontext.entities.Venue;
import com.ticket.servermono.occacontext.infrastructure.repositories.VenueRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VenueServices {
    private final VenueRepository venueRepository;
    private final RegionServices regionService;

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
    
    public List<VenueResponse> getVenuesByRegionWithCount(UUID regionId) {
        return venueRepository.findVenuesByRegionWithCount(regionId);
    }

    @Transactional(readOnly = true)
    public Venue getVenueById(UUID id) {
        return venueRepository.findById(id)
                .orElseThrow((Supplier<RuntimeException>) () ->
                    new ResourceNotFoundException("Venue not found with id: " + id));
    }

    @Transactional
    public Venue createVenue(String location, String address, UUID regionId) {
        Region region = regionService.getRegionById(regionId);
        
        Venue venue = Venue.builder()
                .location(location)
                .address(address)
                .region(region)
                .build();
        
        return venueRepository.save(venue);
    }

    @Transactional
    public Venue updateVenue(UUID id, String location, String address, UUID regionId) {
        Venue venue = getVenueById(id);
        Region region = regionService.getRegionById(regionId);
        
        venue.setLocation(location);
        venue.setAddress(address);
        venue.setRegion(region);
        
        return venueRepository.save(venue);
    }

    @Transactional
    public void deleteVenue(UUID id) {
        if (!venueRepository.existsById(id)) {
            throw new ResourceNotFoundException("Venue not found with id: " + id);
        }
        venueRepository.deleteById(id);
    }
}
