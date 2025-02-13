package com.ticket.servermono.occacontext.usecases;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.occacontext.adapters.dtos.OccaResponse;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OccaServices {

    private final OccaRepository occaRepository;

    public List<OccaResponse> getHeroOccaResponses(String userId) {
        return Optional.ofNullable(userId)
                .filter(id -> !id.isEmpty())
                .map(id -> {
                    // Handle case when userId is present
                    // TODO: Add logic to fetch hero occa optimized for user
                    return List.<OccaResponse>of();
                })
                .orElseGet(() -> 
                    occaRepository.findFirst6HeroOccas(PageRequest.of(0, 6))
                );
    }

    @Transactional(readOnly = true)
    public List<OccaResponse> getFeaturedOccaResponses() {
        return occaRepository.findFirst6HeroOccas(PageRequest.of(0, 6));
    }

    @Transactional(readOnly = true)
    public List<OccaResponse> getUpcomingOccaResponses() {
        // Assuming we want to get the latest 6 occasions
        return occaRepository.findFirst6UpcomingOccas(PageRequest.of(0, 6));
    }

    @Transactional(readOnly = true)
    public List<OccaResponse> getTrendingOccaResponses() {
        // Assuming we want to get the latest 3 occasions
        return occaRepository.findFirst3TrendingOccas(PageRequest.of(0, 3));
    }

    @Transactional(readOnly = true)
    public List<OccaResponse> getRecommendedOccaResponses() {
        // Assuming we want to get the latest 3 occasions
        return occaRepository.findFirst3RecommendedOccas(PageRequest.of(0, 3));
    }

}
