package com.ticket.servermono.occacontext.usecases;

import com.ticket.servermono.occacontext.adapters.dtos.OccaProjection;
import com.ticket.servermono.occacontext.domain.enums.ApprovalStatus;
import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.entities.OccaTrackingStats;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaTrackingStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrendingService {

    private final OccaTrackingStatsRepository occaTrackingStatsRepository;
    private final OccaRepository occaRepository;

    /**
     * Xác định tối đa n sự kiện đang được quan tâm bởi tất cả người dùng trong 1 tuần gần đây
     * Chỉ trả về các sự kiện có trạng thái APPROVED
     *
     * @param n Số lượng sự kiện tối đa cần trả về
     * @return Danh sách các OccaProjection
     */
    @Transactional(readOnly = true)
    public List<OccaProjection> getTrendingOccas(int n) {
        // Lấy tất cả tracking stats
        List<OccaTrackingStats> allTrackingStats = occaTrackingStatsRepository.findAll();
        
        // Sắp xếp theo số lượt xem từ cao xuống thấp
        List<OccaTrackingStats> sortedStats = allTrackingStats.stream()
                .sorted((a, b) -> Integer.compare(b.getTotalCount(), a.getTotalCount()))
                .collect(Collectors.toList());
        
        // Lấy danh sách occaId
        List<UUID> topOccaIds = new ArrayList<>();
        for (OccaTrackingStats stats : sortedStats) {
            // Chỉ lấy tối đa n occaIds
            if (topOccaIds.size() >= n) {
                break;
            }
            
            topOccaIds.add(stats.getOccaId());
        }
        
        // Nếu không có dữ liệu tracking, trả về danh sách rỗng
        if (topOccaIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Lấy các occa theo ID và lọc theo APPROVED status
        List<Occa> occas = occaRepository.findAllById(topOccaIds).stream()
                .filter(occa -> ApprovalStatus.APPROVED.equals(occa.getApprovalStatus()))
                .collect(Collectors.toList());
        
        // Chuyển đổi thành OccaProjection theo thứ tự của topOccaIds
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
}
