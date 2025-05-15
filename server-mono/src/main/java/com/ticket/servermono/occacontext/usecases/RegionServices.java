package com.ticket.servermono.occacontext.usecases;

import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.occacontext.adapters.dtos.RegionDTO;
import com.ticket.servermono.occacontext.adapters.dtos.RegionResponseIdName;
import com.ticket.servermono.occacontext.entities.Region;
import com.ticket.servermono.occacontext.infrastructure.repositories.RegionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegionServices {
    private final RegionRepository regionRepository;


    public List<RegionDTO> getAllRegionsWithOccaCount() {
        return regionRepository.findAllRegionsWithOccaCount();
    }

    @Transactional(readOnly = true)
    public Region getRegionById(UUID id) {
        return regionRepository.findById(id)
            .orElseThrow((Supplier<RuntimeException>) () -> 
                new RuntimeException("Region not found with id: " + id));
    }

    @Transactional
    public Region createRegion(String name, String image) {
        Region region = Region.builder()
            .name(name)
            .image(image)
            .build();
        return regionRepository.save(region);
    }

    @Transactional
    public Region updateRegion(UUID id, String name, String image) {
        Region region = getRegionById(id);
        region.setName(name);
        region.setImage(image);
        return regionRepository.save(region);
    }

    @Transactional
    public void deleteRegion(UUID id) {
        if (!regionRepository.existsById(id)) {
            throw new RuntimeException("Region not found with id: " + id);
        }
        regionRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<RegionResponseIdName> getOnlyNameRegion() {
        return regionRepository.findIdNameRegion();
        
    }
}