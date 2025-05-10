package com.ticket.servermono.occacontext.usecases;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.occacontext.adapters.dtos.OccaProjection;
import com.ticket.servermono.occacontext.adapters.dtos.OccaResponse;
import com.ticket.servermono.occacontext.adapters.dtos.SearchBarTemplateResponse;
import com.ticket.servermono.occacontext.adapters.dtos.SearchOccasResult;
import com.ticket.servermono.occacontext.adapters.dtos.Booking.OccaForBookingResponse;
import com.ticket.servermono.occacontext.adapters.dtos.DetailData.GalleryData;
import com.ticket.servermono.occacontext.adapters.dtos.DetailData.OccaHeroDetailResponse;
import com.ticket.servermono.occacontext.adapters.dtos.DetailData.OverviewData;
import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.entities.Show;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaDetailInfoRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.ShowRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class OccaServices {
    private final OccaRepository occaRepository;
    private final OccaDetailInfoRepository occaDetailInfoRepository;
    private final ShowServices showServices;
    private final ShowRepository showRepository;
    private final TrendingService trendingService;
    private final PersonalRecommendationService personalRecommendationService;

    public List<OccaResponse> getHeroOccaResponses(String userId) {
        return Optional.ofNullable(userId)
                .filter(id -> !id.isEmpty())
                .map(id -> {
                    try {
                        UUID userUuid = UUID.fromString(userId);

                        // Kết hợp occa trending và occa được đề xuất cá nhân
                        List<OccaProjection> trendingProjections = trendingService.getTrendingOccas(3);
                        List<OccaProjection> recommendedProjections = personalRecommendationService
                                .suggestOccasByUserPreferences(userUuid, 3);
                        // Kết hợp hai danh sách và loại bỏ trùng lặp
                        List<OccaProjection> combinedProjections = new ArrayList<>(trendingProjections);

                        for (OccaProjection recommended : recommendedProjections) {
                            // Chỉ thêm vào nếu chưa có trong danh sách kết hợp
                            if (combinedProjections.stream()
                                    .noneMatch(p -> p.getId().equals(recommended.getId()))) {
                                combinedProjections.add(recommended);
                            }
                        }

                        // Giới hạn số lượng tối đa là 6
                        List<OccaProjection> limitedProjections = combinedProjections.stream()
                                .limit(6)
                                .collect(Collectors.toList());

                        return convertToOccaResponses(limitedProjections);
                    } catch (Exception e) {
                        log.error("Error getting hero occas for user: {}", userId, e);
                        // Fallback to default if there's an error
                        List<OccaProjection> projections = occaRepository.findFirst6HeroOccas(PageRequest.of(0, 6));
                        return convertToOccaResponses(projections);
                    }
                })
                .orElseGet(() -> {
                    log.error("User ID is null or empty, falling back to default hero occas");
                    List<OccaProjection> projections = occaRepository.findFirst6HeroOccas(PageRequest.of(0, 6));
                    return convertToOccaResponses(projections);
                });
    }

    @Transactional(readOnly = true)
    public List<OccaResponse> getFeaturedOccaResponses() {
        List<OccaProjection> projections = occaRepository.findFirst6HeroOccas(PageRequest.of(0, 6));
        return convertToOccaResponses(projections);
    }

    @Transactional(readOnly = true)
    public List<OccaResponse> getUpcomingOccaResponses() {
        List<OccaProjection> projections = occaRepository.findFirst6UpcomingOccas(PageRequest.of(0, 6));
        return convertToOccaResponses(projections);
    }

    @Transactional(readOnly = true)
    public List<OccaResponse> getTrendingOccaResponses() {
        List<OccaProjection> projections = trendingService.getTrendingOccas(3);
        return convertToOccaResponses(projections);
    }

    @Transactional(readOnly = true)
    public List<OccaResponse> getRecommendedOccaResponses(String userId) {
        if (userId != null && !userId.isEmpty()) {
            try {
                UUID userUuid = UUID.fromString(userId);
                // Sử dụng PersonalRecommendationService để lấy các đề xuất cá nhân
                List<OccaProjection> projections = personalRecommendationService.suggestOccasByUserPreferences(userUuid,
                        3);
                return convertToOccaResponses(projections);
            } catch (Exception e) {
                log.error("Error getting recommended occas for user: {}", userId, e);
                // Fallback to default if there's an error
            }
        }

        // Fallback for anonymous users or on error
        List<OccaProjection> projections = occaRepository.findFirst3RecommendedOccasFallback(PageRequest.of(0, 3));
        return convertToOccaResponses(projections);
    }

    @Transactional(readOnly = true)
    public List<SearchBarTemplateResponse> searchOccasForSearchBar(String query) {
        List<SearchBarTemplateResponse> results = occaRepository.searchOccasForSearchBar(
                query.toLowerCase(),
                query.toLowerCase() + "%",
                PageRequest.of(0, 10));

        return results.stream()
                .map(r -> {
                    if (r.getShowDateTime() == null) {
                        // Tìm nextShowDateTime cho Occa này
                        Occa occa = occaRepository.findById(r.getId()).orElse(null);
                        LocalDateTime dateTimeToUse = LocalDateTime.now();

                        if (occa != null && occa.getNextShowDateTime() != null) {
                            // Nếu có nextShowDateTime, sử dụng giá trị đó
                            dateTimeToUse = occa.getNextShowDateTime();
                        }

                        return new SearchBarTemplateResponse(
                                r.getId(),
                                r.getTitle(),
                                dateTimeToUse,
                                r.getLocation());
                    }
                    return r;
                })
                .collect(Collectors.toList());
    }

    private UUID parseUuid(String id) {
        if (id == null || id.trim().isEmpty()) {
            return null;
        }
        return UUID.fromString(id);
    }

    // Helper method to convert OccaProjection to OccaResponse with price
    private List<OccaResponse> convertToOccaResponses(List<OccaProjection> projections) {
        return projections.stream()
                .map(p -> {
                    // Sử dụng ngày hiện tại nếu date là null
                    LocalDate date = p.getDate() != null ? p.getDate() : LocalDate.now();
                    // Sử dụng thời gian mặc định nếu time là null
                    LocalTime time = p.getTime() != null ? p.getTime() : LocalTime.of(0, 0);

                    return OccaResponse.builder()
                            .id(p.getId())
                            .title(p.getTitle())
                            .image(p.getImage())
                            .date(date)
                            .time(time)
                            .location(p.getLocation())
                            .price(p.getMinPrice())
                            .categoryId(p.getCategoryId())
                            .venueId(p.getVenueId())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // TODO: Tối ưu lại cái này khi điều chỉnh kiểu dữ liệu của ngày và giá
    @Transactional(readOnly = true)
    public SearchOccasResult searchOccas(
            int page,
            int size,
            String keyword,
            String categoryId,
            String venueId,
            String regionId,
            String sortBy,
            String sortOrder) {

        // Validate and map sortBy to actual entity field names
        String validatedSortBy;
        if (sortBy == null || sortBy.trim().isEmpty()) {
            validatedSortBy = "nextShowDateTime"; // default sort field
        } else {
            switch (sortBy.toLowerCase()) {
                case "date":
                    validatedSortBy = "nextShowDateTime";
                    break;
                case "title":
                    validatedSortBy = "title";
                    break;
                case "price":
                    validatedSortBy = "minPrice"; // map price to minPrice field
                    break;
                default:
                    validatedSortBy = "nextShowDateTime"; // fallback to default
            }
        }

        // Validate sort order
        String validatedSortOrder = (sortOrder == null || sortOrder.trim().isEmpty())
                ? "desc"
                : sortOrder.toLowerCase();

        if (!validatedSortOrder.equals("asc") && !validatedSortOrder.equals("desc")) {
            validatedSortOrder = "desc"; // default sort order
        }

        // Bây giờ có thể sắp xếp trực tiếp bằng Pageable
        Sort sort = Sort.by(Sort.Direction.fromString(validatedSortOrder), validatedSortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        var resultPage = occaRepository.searchOccas(
                keyword,
                parseUuid(categoryId),
                parseUuid(regionId),
                pageable);

        // Chuyển đổi projections thành responses với các thông tin giá từ show
        List<OccaResponse> responses = convertToOccaResponses(resultPage.getContent());

        return SearchOccasResult.builder()
                .occas(responses)
                .totalPages(resultPage.getTotalPages())
                .totalElements(resultPage.getTotalElements())
                .build();
    }

    public OccaHeroDetailResponse getHeroDetail(String occaId) {
        try {
            UUID occaUuid = UUID.fromString(occaId);
            return occaDetailInfoRepository.findHeroDetailById(occaUuid)
                    .orElseThrow(() -> new RuntimeException("Hero not found"));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Hero not found");
        }
    }

    public OverviewData getOverviewDetail(String occaId) {
        try {
            UUID occaUuid = UUID.fromString(occaId);
            return occaDetailInfoRepository.findOverviewById(occaUuid)
                    .orElseThrow(() -> new RuntimeException("Overview not found"));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid occa ID format");
        }
    }

    public List<GalleryData> getGalleryDetail(String occaId) {
        try {
            UUID occaUuid = UUID.fromString(occaId);
            List<String> urls = occaDetailInfoRepository.findGalleryByOccaId(occaUuid)
                    .orElseThrow(() -> new RuntimeException("Gallery not found"));

            return urls.stream()
                    .map(url -> GalleryData.builder().image(url).build())
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid occa ID format");
        }
    }

    @Transactional(readOnly = true)
    public OccaForBookingResponse getOccaForBooking(UUID occaId) {
        if (occaId == null) {
            throw new IllegalArgumentException("Occa ID cannot be null");
        }
        return occaRepository.findOccaForBooking(occaId)
                .orElseThrow(() -> new RuntimeException("Occa not found with id: " + occaId));
    }

    @Transactional(readOnly = true)
    public Occa getOccaById(UUID occaId) {
        return occaRepository.findById(occaId)
                .orElseThrow(() -> new RuntimeException("Occa not found with id: " + occaId));
    }

    // TODO: Tối ưu hóa cập nhật nextShowDateTime trực tiếp bằng occaId thay vì
    // showId
    @Transactional
    public void updateNextShowDateTime(UUID occaId) {
        Occa occa = occaRepository.findById(occaId)
                .orElseThrow(() -> new EntityNotFoundException("Occa not found with ID: " + occaId));

        List<Show> shows = showRepository.findByOccaId(occaId);
        if (shows.isEmpty()) {
            occa.setNextShowDateTime(null);
            occa.setMinPrice(null);
        } else {
            // Find the earliest future show or the latest past show
            LocalDate today = LocalDate.now();
            Optional<Show> nextShow = shows.stream()
                    .filter(show -> !show.getDate().isBefore(today))
                    .min(Comparator.comparing(Show::getDate)
                            .thenComparing(Show::getTime));

            Show targetShow = null;

            if (nextShow.isPresent()) {
                // There is a future show
                targetShow = nextShow.get();
                LocalDateTime nextDateTime = LocalDateTime.of(targetShow.getDate(), targetShow.getTime());
                occa.setNextShowDateTime(nextDateTime);
            } else {
                // Only past shows exist, get the latest one
                Optional<Show> latestShow = shows.stream()
                        .max(Comparator.comparing(Show::getDate)
                                .thenComparing(Show::getTime));

                if (latestShow.isPresent()) {
                    targetShow = latestShow.get();
                    LocalDateTime latestDateTime = LocalDateTime.of(targetShow.getDate(), targetShow.getTime());
                    occa.setNextShowDateTime(latestDateTime);
                }
            }

            // Tính toán minPrice từ targetShow (show tiếp theo hoặc show gần đây nhất)
            if (targetShow != null) {
                // Lấy danh sách các loại vé của show này và tìm giá thấp nhất
                Double minPrice = showServices.getMinPriceForShow(targetShow.getId());
                occa.setMinPrice(minPrice);
            } else {
                occa.setMinPrice(null);
            }
        }
        occaRepository.save(occa);
    }

    @KafkaListener(topics = "update-next-show-datetime")
    public void listenUpdateNextShowDateTime(String occaIdStr) {
        try {
            log.info("Received message to update next show date time for Occa ID: {}", occaIdStr);
            
            UUID occaId = UUID.fromString(occaIdStr);
            
            // Thử với độ trễ tăng dần
            int maxRetries = 3;
            boolean success = false;
            
            for (int attempt = 0; attempt < maxRetries && !success; attempt++) {
                if (attempt > 0) {
                    int delayMs = 500 * (1 << attempt); // Exponential backoff: 500ms, 1s, 2s
                    log.info("Lần thử thứ {} sau {} ms cho Occa ID: {}", attempt + 1, delayMs, occaId);
                    Thread.sleep(delayMs);
                }
                
                Optional<Occa> occaOptional = occaRepository.findById(occaId);
                if (occaOptional.isPresent()) {
                    Occa occa = occaOptional.get();
                    log.info("Đã tìm thấy occa với ID: {}, title: {}", occa.getId(), occa.getTitle());
                    updateNextShowDateTime(occa.getId());
                    success = true;
                } else {
                    log.warn("Occa không tìm thấy với ID: {} (lần thử {})", occaId, attempt + 1);
                }
            }
            
            if (!success) {
                log.error("Occa không tìm thấy sau {} lần thử với ID: {}", maxRetries, occaId);
            }
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật next show datetime: {}", e.getMessage(), e);
        }
    }
}