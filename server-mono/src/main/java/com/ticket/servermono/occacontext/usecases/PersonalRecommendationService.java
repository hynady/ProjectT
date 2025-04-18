package com.ticket.servermono.occacontext.usecases;

import com.ticket.servermono.occacontext.adapters.dtos.OccaProjection;
import com.ticket.servermono.occacontext.domain.enums.ApprovalStatus;
import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.entities.PersonalTrackingStats;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.PersonalTrackingStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PersonalRecommendationService {

    private final PersonalTrackingStatsRepository personalTrackingStatsRepository;
    private final OccaRepository occaRepository;

    /**
     * Lấy top n danh mục được người dùng quan tâm
     * 
     * @param userId ID của người dùng
     * @param n Số lượng danh mục tối đa cần trả về
     * @return Danh sách UUID của các danh mục
     */
    @Transactional(readOnly = true)
    public List<UUID> getTopCategories(UUID userId, int n) {
        List<PersonalTrackingStats> categoryStats = personalTrackingStatsRepository
                .findByUserIdAndTypeOrderByCountDesc(userId, PersonalTrackingStats.TrackingType.CATEGORY);
        
        return categoryStats.stream()
                .limit(n)
                .map(PersonalTrackingStats::getTypeId)
                .collect(Collectors.toList());
    }

    /**
     * Lấy top n địa điểm được người dùng quan tâm
     * 
     * @param userId ID của người dùng
     * @param n Số lượng địa điểm tối đa cần trả về
     * @return Danh sách UUID của các địa điểm
     */
    @Transactional(readOnly = true)
    public List<UUID> getTopVenues(UUID userId, int n) {
        List<PersonalTrackingStats> venueStats = personalTrackingStatsRepository
                .findByUserIdAndTypeOrderByCountDesc(userId, PersonalTrackingStats.TrackingType.LOCATION);
        
        return venueStats.stream()
                .limit(n)
                .map(PersonalTrackingStats::getTypeId)
                .collect(Collectors.toList());
    }

    /**
     * Lấy top n sự kiện được người dùng quan tâm
     * 
     * @param userId ID của người dùng
     * @param n Số lượng sự kiện tối đa cần trả về
     * @return Danh sách OccaProjection
     */
    @Transactional(readOnly = true)
    public List<OccaProjection> getTopUserOccas(UUID userId, int n) {
        List<PersonalTrackingStats> occaStats = personalTrackingStatsRepository
                .findByUserIdAndTypeOrderByCountDesc(userId, PersonalTrackingStats.TrackingType.OCCA);
        
        List<UUID> topOccaIds = occaStats.stream()
                .limit(n)
                .map(PersonalTrackingStats::getTypeId)
                .collect(Collectors.toList());
        
        if (topOccaIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Lấy các occa theo ID và lọc theo APPROVED status
        List<Occa> occas = occaRepository.findAllById(topOccaIds).stream()
                .filter(occa -> ApprovalStatus.APPROVED.equals(occa.getApprovalStatus()))
                .collect(Collectors.toList());
        
        // Chuyển đổi thành OccaProjection
        return occas.stream()
                .map(occa -> new OccaProjection(
                        occa.getId(),
                        occa.getTitle(),
                        occa.getImage(),
                        occa.getNextShowDateTime(),
                        occa.getVenue() != null ? occa.getVenue().getLocation() : null,
                        occa.getCategory() != null ? occa.getCategory().getId() : null,
                        occa.getVenue() != null ? occa.getVenue().getId() : null,
                        occa.getMinPrice()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Gợi ý các sự kiện dựa trên danh mục và địa điểm mà người dùng quan tâm
     * 
     * @param userId ID của người dùng
     * @param n Số lượng sự kiện tối đa cần trả về
     * @return Danh sách OccaProjection
     */
    @Transactional(readOnly = true)
    public List<OccaProjection> suggestOccasByUserPreferences(UUID userId, int n) {
        // Lấy top danh mục và địa điểm
        List<UUID> topCategoryIds = getTopCategories(userId, 3);
        List<UUID> topVenueIds = getTopVenues(userId, 3);
        
        // Nếu người dùng không có dữ liệu tracking
        if (topCategoryIds.isEmpty() && topVenueIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Tìm tất cả các occa có status APPROVED và có category hoặc venue trong top của user
        List<Occa> allOccas = occaRepository.findAll().stream()
                .filter(occa -> ApprovalStatus.APPROVED.equals(occa.getApprovalStatus()))
                .filter(occa -> {
                    boolean matchesCategory = occa.getCategory() != null && 
                            topCategoryIds.contains(occa.getCategory().getId());
                    boolean matchesVenue = occa.getVenue() != null && 
                            topVenueIds.contains(occa.getVenue().getId());
                    return matchesCategory || matchesVenue;
                })
                .collect(Collectors.toList());
        
        // Sắp xếp ưu tiên occa có cả category và venue trong top của user
        allOccas.sort((a, b) -> {
            boolean aMatchesCategory = a.getCategory() != null && 
                    topCategoryIds.contains(a.getCategory().getId());
            boolean aMatchesVenue = a.getVenue() != null && 
                    topVenueIds.contains(a.getVenue().getId());
                    
            boolean bMatchesCategory = b.getCategory() != null && 
                    topCategoryIds.contains(b.getCategory().getId());
            boolean bMatchesVenue = b.getVenue() != null && 
                    topVenueIds.contains(b.getVenue().getId());
            
            int aMatches = (aMatchesCategory ? 1 : 0) + (aMatchesVenue ? 1 : 0);
            int bMatches = (bMatchesCategory ? 1 : 0) + (bMatchesVenue ? 1 : 0);
            
            return Integer.compare(bMatches, aMatches); // Sắp xếp giảm dần
        });
        
        // Lấy tối đa n phần tử
        List<Occa> topOccas = allOccas.stream()
                .limit(n)
                .collect(Collectors.toList());
        
        // Chuyển đổi thành OccaProjection
        return topOccas.stream()
                .map(occa -> new OccaProjection(
                        occa.getId(),
                        occa.getTitle(),
                        occa.getImage(),
                        occa.getNextShowDateTime(),
                        occa.getVenue() != null ? occa.getVenue().getLocation() : null,
                        occa.getCategory() != null ? occa.getCategory().getId() : null,
                        occa.getVenue() != null ? occa.getVenue().getId() : null,
                        occa.getMinPrice()
                ))
                .collect(Collectors.toList());
    }
}
