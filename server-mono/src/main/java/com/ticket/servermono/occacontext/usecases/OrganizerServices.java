package com.ticket.servermono.occacontext.usecases;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.servermono.occacontext.adapters.dtos.kafka.TicketClassCreateDTO;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.BasicInfoDTO;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.CreateOccaRequest;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.CreateOccaResponse;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.GalleryDTO;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.OccaDetailResponse;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.OrganizerOccaUnit;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.ShowDTO;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.TicketDTO;
import com.ticket.servermono.occacontext.domain.enums.ApprovalStatus;
import com.ticket.servermono.occacontext.entities.Category;
import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.entities.OccaDetailInfo;
import com.ticket.servermono.occacontext.entities.Region;
import com.ticket.servermono.occacontext.entities.Show;
import com.ticket.servermono.occacontext.entities.Venue;
import com.ticket.servermono.occacontext.infrastructure.clients.TicketClassGrpcClient;
import com.ticket.servermono.occacontext.infrastructure.repositories.CategoryRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaDetailInfoRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.RegionRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.ShowRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.VenueRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrganizerServices {

    private final OccaRepository occaRepository;
    private final VenueRepository venueRepository;
    private final RegionRepository regionRepository;
    private final CategoryRepository categoryRepository;
    private final OccaDetailInfoRepository occaDetailInfoRepository;
    private final ShowRepository showRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final TicketClassGrpcClient ticketClassGrpcClient;

    /**
     * Lấy danh sách sự kiện của người tổ chức với phân trang, sắp xếp và lọc
     * 
     * @param page      Số trang (bắt đầu từ 0)
     * @param size      Số phần tử mỗi trang
     * @param status    Trạng thái sự kiện (draft, pending, approved, rejected)
     * @param search    Từ khóa tìm kiếm
     * @param sort      Trường để sắp xếp (title, location)
     * @param direction Hướng sắp xếp (asc, desc)
     * @return Page<OrganizerOccaUnit> Danh sách sự kiện đã phân trang
     */
    @Transactional(readOnly = true)
    public Page<OrganizerOccaUnit> getOrganizerOccas(
            int page,
            int size,
            String status,
            String search,
            String sort,
            String direction) {

        // Xác định hướng sắp xếp
        Direction sortDirection = "desc".equalsIgnoreCase(direction) ? Direction.DESC : Direction.ASC;

        // Xác định trường sắp xếp
        String sortField = "title";
        if ("location".equalsIgnoreCase(sort)) {
            sortField = "venue.location";
        }

        // Tạo đối tượng Pageable
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortField));

        // Parse trạng thái sự kiện nếu có
        ApprovalStatus approvalStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                approvalStatus = ApprovalStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid approval status: {}", status);
            }
        }

        // Lấy dữ liệu từ repository
        Page<Occa> occaPage;
        if (approvalStatus != null) {
            if (search != null && !search.isEmpty()) {
                // Tìm kiếm theo trạng thái và từ khóa
                occaPage = occaRepository.findByApprovalStatusAndTitleContainingIgnoreCase(
                        approvalStatus, search, pageable);
            } else {
                // Tìm kiếm chỉ theo trạng thái
                occaPage = occaRepository.findByApprovalStatus(approvalStatus, pageable);
            }
        } else {
            if (search != null && !search.isEmpty()) {
                // Tìm kiếm chỉ theo từ khóa
                occaPage = occaRepository.findByTitleContainingIgnoreCase(search, pageable);
            } else {
                // Lấy tất cả
                occaPage = occaRepository.findAll(pageable);
            }
        }

        // Chuyển đổi sang DTO
        List<OrganizerOccaUnit> content = occaPage.getContent().stream()
                .map(this::convertToOrganizerOccaUnit)
                .collect(Collectors.toList());

        // Tạo Page mới với dữ liệu đã chuyển đổi
        return new PageImpl<>(content, pageable, occaPage.getTotalElements());
    }

    /**
     * Tạo mới sự kiện
     * 
     * @param request Thông tin để tạo sự kiện mới
     * @return CreateOccaResponse Thông tin sự kiện đã tạo
     */
    @Transactional
    public CreateOccaResponse createOcca(CreateOccaRequest request) {
        log.info("Creating new occa with title: {}", request.getBasicInfo().getTitle());

        // 1. Tìm hoặc tạo mới Venue
        Venue venue = findOrCreateVenue(request.getBasicInfo().getLocation(), request.getBasicInfo().getAddress());

        // 2. Tìm category mặc định là "Âm nhạc"
        Category category = categoryRepository.findFirstByName("Âm nhạc")
                .orElseThrow(() -> new EntityNotFoundException("Default category 'Âm nhạc' not found"));

        // 3. Tạo và lưu entity Occa
        ApprovalStatus approvalStatus = parseApprovalStatus(request.getApprovalStatus());

        Occa occa = Occa.builder()
                .title(request.getBasicInfo().getTitle())
                .artist(request.getBasicInfo().getArtist())
                .image(request.getBasicInfo().getBannerUrl())
                .venue(venue)
                .category(category)
                .status(request.getStatus())
                .approvalStatus(approvalStatus)
                .build();

        Occa savedOcca = occaRepository.save(occa);

        // 4. Tạo và lưu entity OccaDetailInfo
        List<String> galleryUrls = request.getGallery() != null ? 
                request.getGallery().stream()
                        .map(gallery -> gallery.getImage())
                        .collect(Collectors.toList()) :
                new ArrayList<>();

        OccaDetailInfo detailInfo = OccaDetailInfo.builder()
                .occa(savedOcca)
                .bannerUrl(request.getBasicInfo().getBannerUrl())
                .description(request.getBasicInfo().getDescription())
                .organizer("VinGroup Entertainment")
                .galleryUrls(galleryUrls)
                .build();

        occaDetailInfoRepository.save(detailInfo);

        // 5. Nhóm các vé theo showId
        Map<String, List<TicketDTO>> ticketsByShowId = new HashMap<>();
        if (request.getTickets() != null) {
            for (TicketDTO ticket : request.getTickets()) {
                if (ticket.getShowId() != null) {
                    ticketsByShowId.computeIfAbsent(ticket.getShowId(), k -> new ArrayList<>()).add(ticket);
                } else {
                    log.warn("Ticket without showId, will be skipped: {}", ticket);
                }
            }
        }

        // 6. Tạo show và xử lý vé cùng lúc
        if (request.getShows() != null) {
            for (ShowDTO showDTO : request.getShows()) {
                // Tạo và lưu show mới
                Show show = Show.builder()
                        .occa(savedOcca)
                        .date(LocalDate.parse(showDTO.getDate()))
                        .time(LocalTime.parse(showDTO.getTime()))
                        .saleStatus(showDTO.getSaleStatus())
                        .build();

                Show savedShow = showRepository.save(show);
                log.info("Created show with ID: {} for date: {}, time: {}", 
                        savedShow.getId(), savedShow.getDate(), savedShow.getTime());
                
                // Xử lý các vé cho show này dựa trên ID trong request
                String showIdInRequest = showDTO.getId();
                if (showIdInRequest != null && !showIdInRequest.isEmpty()) {
                    List<TicketDTO> ticketsForThisShow = ticketsByShowId.get(showIdInRequest);
                    if (ticketsForThisShow != null && !ticketsForThisShow.isEmpty()) {
                        log.info("Processing {} tickets for show with request ID: {}", 
                                ticketsForThisShow.size(), showIdInRequest);
                        
                        for (TicketDTO ticketDTO : ticketsForThisShow) {
                            try {
                                // Tạo DTO cho ticket class
                                TicketClassCreateDTO ticketClassDTO = TicketClassCreateDTO.builder()
                                        .showId(savedShow.getId())
                                        .type(ticketDTO.getType())
                                        .price(ticketDTO.getPrice())
                                        .availableQuantity(ticketDTO.getAvailableQuantity())
                                        .build();
                                
                                // Chuyển đổi DTO thành JSON string
                                ObjectMapper objectMapper = new ObjectMapper();
                                String jsonMessage = objectMapper.writeValueAsString(ticketClassDTO);

                                // Gửi message qua Kafka
                                kafkaTemplate.send("ticket-class-create", savedShow.getId().toString(), jsonMessage);
                                log.info("Sent ticket class creation message to Kafka for show ID: {}, ticket type: {}",
                                        savedShow.getId(), ticketDTO.getType());
                            } catch (Exception e) {
                                log.error("Failed to send ticket class creation message: {}", e.getMessage(), e);
                            }
                        }
                    }
                }
            }
        }

        // 7. Trả về response
        return CreateOccaResponse.builder()
                .id(savedOcca.getId())
                .title(savedOcca.getTitle())
                .status(savedOcca.getStatus())
                .approvalStatus(savedOcca.getApprovalStatus().toString().toLowerCase())
                .build();
    }

    /**
     * Tìm hoặc tạo mới venue với region mặc định là Đà Nẵng
     */
    private Venue findOrCreateVenue(String location, String address) {
        return venueRepository.findByLocation(location)
                .orElseGet(() -> {
                    Region region = regionRepository.findFirstByName("Đà Nẵng")
                            .orElseThrow(() -> new EntityNotFoundException("Default region 'Đà Nẵng' not found"));

                    Venue newVenue = Venue.builder()
                            .location(location)
                            .address(address)
                            .region(region)
                            .build();
                    return venueRepository.save(newVenue);
                });
    }

    /**
     * Parse approval status từ string
     */
    private ApprovalStatus parseApprovalStatus(String status) {
        if (status == null || status.isEmpty()) {
            return ApprovalStatus.DRAFT;
        }

        try {
            return ApprovalStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid approval status: {}, falling back to DRAFT", status);
            return ApprovalStatus.DRAFT;
        }
    }

    /**
     * Chuyển đổi entity Occa sang DTO OrganizerOccaUnit
     */
    private OrganizerOccaUnit convertToOrganizerOccaUnit(Occa occa) {
        return OrganizerOccaUnit.builder()
                .id(occa.getId())
                .title(occa.getTitle())
                .location(occa.getVenue() != null ? occa.getVenue().getLocation() : "")
                .image(occa.getImage())
                .approvalStatus(occa.getApprovalStatus().toString().toLowerCase())
                .build();
    }

    /**
     * Lấy chi tiết sự kiện để chỉnh sửa
     * 
     * @param occaId ID của sự kiện
     * @return Thông tin chi tiết sự kiện để chỉnh sửa
     */
    @Transactional(readOnly = true)
    public OccaDetailResponse getOccaDetail(UUID occaId) {
        log.info("Fetching occa detail for ID: {}", occaId);

        // 1. Tìm entity Occa
        Occa occa = occaRepository.findById(occaId)
                .orElseThrow(() -> new EntityNotFoundException("Occa not found with id: " + occaId));

        // 2. Lấy thông tin chi tiết
        OccaDetailInfo detailInfo = occaDetailInfoRepository.findByOccaId(occaId)
                .orElseThrow(() -> new EntityNotFoundException("Occa detail info not found for occa id: " + occaId));

        // 3. Lấy danh sách show
        List<Show> shows = showRepository.findByOccaId(occaId);

        // 4. Lấy danh sách ticket từ gRPC service
        List<TicketDTO> tickets = new ArrayList<>();
        if (!shows.isEmpty()) {
            for (Show show : shows) {
                try {
                    // Gọi gRPC để lấy danh sách ticket class cho mỗi show
                    List<TicketDTO> showTickets = ticketClassGrpcClient
                            .getTicketClassesByShowId(show.getId().toString());
                    tickets.addAll(showTickets);
                } catch (Exception e) {
                    log.error("Error fetching ticket classes for show {}: {}", show.getId(), e.getMessage());
                }
            }
        }

        // 5. Tạo response object
        BasicInfoDTO basicInfo = BasicInfoDTO.builder()
                .title(occa.getTitle())
                .artist(occa.getArtist())
                .location(occa.getVenue() != null ? occa.getVenue().getLocation() : "")
                .address(occa.getVenue() != null ? occa.getVenue().getAddress() : "")
                .description(detailInfo.getDescription())
                .bannerUrl(detailInfo.getBannerUrl())
                .build();

        List<ShowDTO> showDTOs = shows.stream()
                .map(show -> ShowDTO.builder()
                        .id(show.getId().toString())
                        .date(show.getDate().toString())
                        .time(show.getTime().toString())
                        .build())
                .collect(Collectors.toList());

        List<GalleryDTO> galleryDTOs = detailInfo.getGalleryUrls() != null ? detailInfo.getGalleryUrls().stream()
                .map(url -> GalleryDTO.builder()
                        .id(UUID.randomUUID().toString()) // Tạo ID tạm thời để frontend đánh dấu
                        .image(url)
                        .build())
                .collect(Collectors.toList()) : new ArrayList<>();

        return OccaDetailResponse.builder()
                .basicInfo(basicInfo)
                .shows(showDTOs)
                .tickets(tickets)
                .gallery(galleryDTOs)
                .build();
    }

    /**
     * Cập nhật thông tin sự kiện - hỗ trợ partial update
     * 
     * @param occaId  ID của sự kiện cần cập nhật
     * @param request Thông tin cần cập nhật, có thể chỉ chứa một số section
     * @return Thông tin sự kiện sau khi cập nhật
     */
    @Transactional
    public CreateOccaResponse updateOcca(UUID occaId, CreateOccaRequest request) {
        log.info("Updating occa with ID: {}", occaId);

        // 1. Tìm entity Occa
        Occa occa = occaRepository.findById(occaId)
                .orElseThrow(() -> new EntityNotFoundException("Occa not found with id: " + occaId));

        // 2. Cập nhật thông tin cơ bản nếu được cung cấp
        if (request.getBasicInfo() != null) {
            BasicInfoDTO basicInfo = request.getBasicInfo();
            
            // Cập nhật Venue nếu location hoặc address được cung cấp
            if (basicInfo.getLocation() != null || basicInfo.getAddress() != null) {
                String location = basicInfo.getLocation() != null ? 
                        basicInfo.getLocation() : 
                        (occa.getVenue() != null ? occa.getVenue().getLocation() : "");
                
                String address = basicInfo.getAddress() != null ? 
                        basicInfo.getAddress() : 
                        (occa.getVenue() != null ? occa.getVenue().getAddress() : "");
                
                Venue venue = findOrCreateVenue(location, address);
                occa.setVenue(venue);
            }
            
            // Cập nhật các trường cơ bản khác của Occa
            if (basicInfo.getTitle() != null) occa.setTitle(basicInfo.getTitle());
            if (basicInfo.getArtist() != null) occa.setArtist(basicInfo.getArtist());
            if (basicInfo.getBannerUrl() != null) occa.setImage(basicInfo.getBannerUrl());
            
            // Lấy thông tin chi tiết của Occa
            OccaDetailInfo detailInfo = occaDetailInfoRepository.findByOccaId(occaId)
                    .orElseGet(() -> OccaDetailInfo.builder().occa(occa).build());
            
            // Cập nhật thông tin chi tiết
            if (basicInfo.getBannerUrl() != null) detailInfo.setBannerUrl(basicInfo.getBannerUrl());
            if (basicInfo.getDescription() != null) detailInfo.setDescription(basicInfo.getDescription());
            
            occaDetailInfoRepository.save(detailInfo);
        }
        
        // 3. Cập nhật trạng thái nếu được cung cấp
        if (request.getStatus() != null) {
            occa.setStatus(request.getStatus());
        }
        
        if (request.getApprovalStatus() != null) {
            ApprovalStatus approvalStatus = parseApprovalStatus(request.getApprovalStatus());
            occa.setApprovalStatus(approvalStatus);
        }
        
        // Lưu các thay đổi cơ bản của occa
        occa.setUpdatedAt(LocalDateTime.now());  // Cập nhật thời gian cập nhật
        Occa savedOcca = occaRepository.save(occa);
        
        // 4. Cập nhật gallery nếu được cung cấp
        if (request.getGallery() != null) {
            OccaDetailInfo detailInfo = occaDetailInfoRepository.findByOccaId(occaId)
                    .orElseGet(() -> OccaDetailInfo.builder().occa(savedOcca).build());
            
            List<String> galleryUrls = request.getGallery().stream()
                    .map(GalleryDTO::getImage)
                    .collect(Collectors.toList());
            
            detailInfo.setGalleryUrls(galleryUrls);
            occaDetailInfoRepository.save(detailInfo);
        }
        
        // 5. Cập nhật shows nếu được cung cấp
        Map<String, Show> idToShowMap = new HashMap<>(); // Map lưu ánh xạ giữa ID (cả tạm và thật) và Show
        
        if (request.getShows() != null) {
            List<Show> existingShows = showRepository.findByOccaId(occaId);
            Map<String, Show> existingShowMap = new HashMap<>();
            
            // Tạo mapping cho các show hiện có theo ID
            for (Show show : existingShows) {
                existingShowMap.put(show.getId().toString(), show);
                idToShowMap.put(show.getId().toString(), show); // Cũng thêm vào idToShowMap để dùng cho tickets
            }
            
            List<Show> showsToKeep = new ArrayList<>();
            List<Show> showsToDelete = new ArrayList<>(existingShows); // Mặc định xóa tất cả, sau đó loại bỏ các show cần giữ lại
            
            // Xử lý các show từ request
            for (ShowDTO showDTO : request.getShows()) {
                String showId = showDTO.getId();
                Show show;
                
                if (showId != null && !showId.isEmpty() && !showId.startsWith("temp-") && existingShowMap.containsKey(showId)) {
                    // Cập nhật show hiện có
                    show = existingShowMap.get(showId);
                    show.setDate(LocalDate.parse(showDTO.getDate()));
                    show.setTime(LocalTime.parse(showDTO.getTime()));
                    
                    // Nếu có status, cập nhật thêm
                    if (showDTO.getSaleStatus() != null) {
                        show.setSaleStatus(showDTO.getSaleStatus());
                    }
                    
                    show = showRepository.save(show);
                    showsToKeep.add(show);
                    showsToDelete.remove(show); // Không xóa show này
                } else {
                    // Tạo show mới
                    show = Show.builder()
                            .occa(savedOcca)
                            .date(LocalDate.parse(showDTO.getDate()))
                            .time(LocalTime.parse(showDTO.getTime()))
                            .saleStatus(showDTO.getSaleStatus()) // Có thể null, nhưng không sao
                            .build();
                    
                    show = showRepository.save(show);
                }
                
                // Lưu ánh xạ giữa ID trong request và Show thật
                idToShowMap.put(showId, show);
            }
            
            // Xóa các show không còn được sử dụng
            if (!showsToDelete.isEmpty()) {
                showRepository.deleteAll(showsToDelete);
            }
        } else if (request.getTickets() != null) {
            // Nếu chỉ có tickets mà không có shows, cần lấy tất cả shows hiện có để ánh xạ
            List<Show> existingShows = showRepository.findByOccaId(occaId);
            for (Show show : existingShows) {
                idToShowMap.put(show.getId().toString(), show);
            }
        }
        
        // 6. Cập nhật tickets nếu được cung cấp
        if (request.getTickets() != null) {
            // Nhóm các vé theo showId để xử lý
            Map<String, List<TicketDTO>> ticketsByShowId = new HashMap<>();
            for (TicketDTO ticket : request.getTickets()) {
                if (ticket.getShowId() != null) {
                    ticketsByShowId.computeIfAbsent(ticket.getShowId(), k -> new ArrayList<>()).add(ticket);
                } else {
                    log.warn("Ticket without showId, will be skipped: {}", ticket);
                }
            }
            
            // Xử lý tickets cho từng show
            for (Map.Entry<String, List<TicketDTO>> entry : ticketsByShowId.entrySet()) {
                String showId = entry.getKey();
                List<TicketDTO> ticketsForShow = entry.getValue();
                
                Show show = idToShowMap.get(showId);
                if (show != null) {
                    // Xử lý các vé cho show này
                    processTicketsForShow(show, ticketsForShow);
                } else {
                    log.warn("Cannot find show with ID: {} for tickets, skipping these tickets", showId);
                }
            }
        }
        
        // 7. Trả về response với thông tin cơ bản và thời gian cập nhật
        return CreateOccaResponse.builder()
                .id(savedOcca.getId())
                .title(savedOcca.getTitle())
                .status(savedOcca.getStatus())
                .approvalStatus(savedOcca.getApprovalStatus().toString().toLowerCase())
                .updatedAt(savedOcca.getUpdatedAt())
                .build();
    }
    
    /**
     * Xử lý vé cho một show cụ thể
     * 
     * @param show      Show để gắn vé
     * @param tickets   Danh sách vé cần xử lý
     */
    private void processTicketsForShow(Show show, List<TicketDTO> tickets) {
        // Log để debug
        log.info("Processing {} tickets for show ID: {}, date: {}, time: {}", 
                tickets.size(), show.getId(), show.getDate(), show.getTime());
        
        for (TicketDTO ticketDTO : tickets) {
            try {
                log.info("Processing ticket: type={}, showId={}, id={}", 
                        ticketDTO.getType(), ticketDTO.getShowId(), ticketDTO.getId());
                
                // Kiểm tra xem showId trong ticketDTO có khớp với ID của show không
                if (ticketDTO.getShowId() != null && !ticketDTO.getShowId().equals(show.getId().toString()) 
                        && !ticketDTO.getShowId().startsWith("temp-")) {
                    log.warn("Ticket showId [{}] does not match provided show ID [{}], skipping", 
                            ticketDTO.getShowId(), show.getId());
                    continue;
                }
                
                // Tạo DTO và chuyển đổi thành JSON
                TicketClassCreateDTO.TicketClassCreateDTOBuilder builder = TicketClassCreateDTO.builder()
                        .showId(show.getId())
                        .type(ticketDTO.getType())
                        .price(ticketDTO.getPrice())
                        .availableQuantity(ticketDTO.getAvailableQuantity());
                
                // Thêm ID của ticket class nếu có
                if (ticketDTO.getId() != null && !ticketDTO.getId().isEmpty() && !ticketDTO.getId().startsWith("temp-")) {
                    // Nếu ID không phải là ID tạm, gửi nó để backend có thể cập nhật thay vì tạo mới
                    builder.id(UUID.fromString(ticketDTO.getId()));
                }
                
                TicketClassCreateDTO ticketClassDTO = builder.build();

                // Chuyển đổi DTO thành JSON string
                ObjectMapper objectMapper = new ObjectMapper();
                String jsonMessage = objectMapper.writeValueAsString(ticketClassDTO);

                // Gửi message qua Kafka
                //TODO: Tối ưu lại vì case xoá show bị gửi message
                kafkaTemplate.send("ticket-class-create", show.getId().toString(), jsonMessage);
                log.info("Sent ticket class message to Kafka for show ID: {}, ticket type: {}", 
                        show.getId(), ticketDTO.getType());
            } catch (Exception e) {
                log.error("Failed to send ticket class message for show {}: {}", show.getId(), e.getMessage(), e);
            }
        }
    }
}