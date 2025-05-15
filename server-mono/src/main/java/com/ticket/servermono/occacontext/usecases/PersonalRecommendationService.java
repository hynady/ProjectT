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
    }    /**
     * Gợi ý các sự kiện dựa trên danh mục, địa điểm và sự kiện mà người dùng quan tâm
     * 
     * @param userId ID của người dùng
     * @param n Số lượng sự kiện tối đa cần trả về
     * @return Danh sách OccaProjection
     */
    @Transactional(readOnly = true)
    public List<OccaProjection> suggestOccasByUserPreferences(UUID userId, int n) {
        // Lấy top danh mục, địa điểm và sự kiện
        List<UUID> topCategoryIds = getTopCategories(userId, 3);
        List<UUID> topVenueIds = getTopVenues(userId, 3);
        List<UUID> topOccaIds = getTopUserOccas(userId, 5).stream()
                .map(OccaProjection::getId)
                .collect(Collectors.toList());
        
        // Lấy sự kiện liên quan từ các occa mà người dùng đã quan tâm
        Set<UUID> relatedOccaIds = new HashSet<>();
        if (!topOccaIds.isEmpty()) {
            List<Occa> userOccas = occaRepository.findAllById(topOccaIds);
            // Thêm occa có cùng danh mục hoặc địa điểm với occa mà người dùng đã quan tâm
            for (Occa occa : userOccas) {
                if (occa.getCategory() != null) {
                    List<Occa> similarCategory = occaRepository.findByCategoryId(occa.getCategory().getId());
                    similarCategory.stream()
                            .filter(o -> !topOccaIds.contains(o.getId()) && ApprovalStatus.APPROVED.equals(o.getApprovalStatus()))
                            .forEach(o -> relatedOccaIds.add(o.getId()));
                }
                if (occa.getVenue() != null) {
                    List<Occa> similarVenue = occaRepository.findByVenueId(occa.getVenue().getId());
                    similarVenue.stream()
                            .filter(o -> !topOccaIds.contains(o.getId()) && ApprovalStatus.APPROVED.equals(o.getApprovalStatus()))
                            .forEach(o -> relatedOccaIds.add(o.getId()));
                }
                // Thêm occa có cùng nghệ sĩ nếu có
                if (occa.getArtist() != null && !occa.getArtist().isEmpty()) {
                    List<Occa> similarArtist = occaRepository.findByArtistContainingIgnoreCase(occa.getArtist());
                    similarArtist.stream()
                            .filter(o -> !topOccaIds.contains(o.getId()) && ApprovalStatus.APPROVED.equals(o.getApprovalStatus()))
                            .forEach(o -> relatedOccaIds.add(o.getId()));
                }
            }
        }
        
        // Nếu người dùng không có dữ liệu tracking và không có sự kiện liên quan
        if (topCategoryIds.isEmpty() && topVenueIds.isEmpty() && relatedOccaIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Tìm tất cả các occa có status APPROVED và phù hợp với tiêu chí
        List<Occa> allOccas = occaRepository.findAll().stream()
                .filter(occa -> ApprovalStatus.APPROVED.equals(occa.getApprovalStatus()))
                .filter(occa -> {
                    // Loại bỏ những sự kiện mà người dùng đã quan tâm
                    if (topOccaIds.contains(occa.getId())) {
                        return false;
                    }
                    
                    boolean matchesCategory = occa.getCategory() != null && 
                            topCategoryIds.contains(occa.getCategory().getId());
                    boolean matchesVenue = occa.getVenue() != null && 
                            topVenueIds.contains(occa.getVenue().getId());
                    boolean isRelated = relatedOccaIds.contains(occa.getId());
                    
                    return matchesCategory || matchesVenue || isRelated;
                })
                .collect(Collectors.toList());
        
        // Tạo hệ thống chấm điểm cho mỗi Occa dựa trên mức độ phù hợp
        Map<UUID, Integer> occaScores = new HashMap<>();
        
        for (Occa occa : allOccas) {
            int score = 0;
            
            // Điểm dành cho occa có category phù hợp
            if (occa.getCategory() != null && topCategoryIds.contains(occa.getCategory().getId())) {
                score += 3;
            }
            
            // Điểm dành cho occa có venue phù hợp
            if (occa.getVenue() != null && topVenueIds.contains(occa.getVenue().getId())) {
                score += 2;
            }
            
            // Điểm dành cho occa liên quan đến occa người dùng đã quan tâm
            if (relatedOccaIds.contains(occa.getId())) {
                score += 4;
            }
            
            // Lưu điểm vào map
            occaScores.put(occa.getId(), score);
        }
        
        // Sắp xếp dựa trên điểm số
        allOccas.sort((a, b) -> {
            int scoreA = occaScores.getOrDefault(a.getId(), 0);
            int scoreB = occaScores.getOrDefault(b.getId(), 0);
            
            // Nếu điểm bằng nhau, ưu tiên sự kiện mới hơn
            if (scoreA == scoreB) {
                if (a.getNextShowDateTime() != null && b.getNextShowDateTime() != null) {
                    return a.getNextShowDateTime().compareTo(b.getNextShowDateTime());
                } else if (a.getNextShowDateTime() != null) {
                    return -1;
                } else if (b.getNextShowDateTime() != null) {
                    return 1;
                }
                return 0;
            }
            
            return Integer.compare(scoreB, scoreA); // Sắp xếp giảm dần theo điểm
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
