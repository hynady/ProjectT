package com.ticket.servermono.occacontext.usecases;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
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

import com.ticket.servermono.occacontext.adapters.dtos.kafka.TicketClassCreateDTO;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.CreateOccaRequest;
import com.ticket.servermono.occacontext.adapters.dtos.organizer.CreateOccaResponse;
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
    
    /**
     * Lấy danh sách sự kiện của người tổ chức với phân trang, sắp xếp và lọc
     * 
     * @param page Số trang (bắt đầu từ 0)
     * @param size Số phần tử mỗi trang
     * @param status Trạng thái sự kiện (draft, pending, approved, rejected)
     * @param search Từ khóa tìm kiếm
     * @param sort Trường để sắp xếp (title, location)
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
                .category(category)  // Thêm category mặc định
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
                .organizer("VinGroup Entertainment") // Mặc định hoặc lấy từ người dùng hiện tại
                .galleryUrls(galleryUrls)
                .build();
        
        occaDetailInfoRepository.save(detailInfo);
        
        // 5. Tạo và lưu các Show
        List<Show> shows = new ArrayList<>();
        if (request.getShows() != null) {
            for (ShowDTO showDTO : request.getShows()) {
                Show show = Show.builder()
                        .occa(savedOcca)
                        .date(LocalDate.parse(showDTO.getDate()))
                        .time(LocalTime.parse(showDTO.getTime()))
                        .build();
                
                shows.add(showRepository.save(show));
            }
        }
        
        // 6. Xử lý thông tin ticket bằng Kafka
        if (request.getTickets() != null && !shows.isEmpty()) {
            // Mặc định sử dụng show đầu tiên nếu có nhiều show
            Show targetShow = shows.get(0);
            
            for (TicketDTO ticketDTO : request.getTickets()) {
                // Tạo DTO và gửi qua Kafka
                TicketClassCreateDTO ticketClassDTO = TicketClassCreateDTO.builder()
                        .showId(targetShow.getId())
                        .type(ticketDTO.getType())
                        .price(ticketDTO.getPrice())
                        .availableQuantity(ticketDTO.getAvailableQuantity())
                        .build();
                
                // Gửi message qua Kafka
                kafkaTemplate.send("ticket-class-create", targetShow.getId().toString(), ticketClassDTO);
                log.info("Sent ticket class creation message to Kafka for show ID: {}", targetShow.getId());
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
}