package com.ticket.servermono.occacontext.infrastructure.config;

import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.ticket.servermono.occacontext.entities.Region;
import com.ticket.servermono.occacontext.infrastructure.repositories.RegionRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.VenueRepository;
import com.ticket.servermono.occacontext.usecases.VenueServices;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Order(1)
@Slf4j
@RequiredArgsConstructor
public class VenueDataInitializer implements CommandLineRunner {

    private final VenueServices venueService;
    private final VenueRepository  venueRepository;
    private final RegionRepository regionRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking if venues need to be initialized...");

        if (venueRepository.findAll().isEmpty()) {
            log.info("Initializing Venue data...");

            // Hanoi venues
            Optional<Region> hanoi = regionRepository.findFirstByName("Hà Nội");
            if (hanoi.isPresent()) {
                venueService.createVenue(
                    "Nhà hát lớn Hà Nội",
                    "1 Tràng Tiền, Phan Chu Trinh, Hoàn Kiếm, Hà Nội",
                    hanoi.get().getId()
                );

                venueService.createVenue(
                    "Cung Văn hóa Hữu nghị Việt Xô",
                    "91 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
                    hanoi.get().getId()
                );
            }

            // HCMC venues
            Optional<Region> hcmc = regionRepository.findFirstByName("Hồ Chí Minh");
            if (hcmc.isPresent()) {
                venueService.createVenue(
                    "Nhà hát Thành phố Hồ Chí Minh",
                    "7 Công trường Lam Sơn, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh",
                    hcmc.get().getId()
                );

                venueService.createVenue(
                    "Nhà Văn hóa Thanh Niên",
                    "4 Phạm Ngọc Thạch, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh",
                    hcmc.get().getId()
                );
            }

            // Da Nang venues
            Optional<Region> danang = regionRepository.findFirstByName("Đà Nẵng");
            if (danang.isPresent()) {
                venueService.createVenue(
                    "Nhà hát Trưng Vương",
                    "166 Bạch Đằng, Hải Châu, Đà Nẵng",
                    danang.get().getId()
                );

                venueService.createVenue(
                    "Cung Thể thao Tiên Sơn",
                    "1 Phan Đăng Lưu, Hải Châu, Đà Nẵng",
                    danang.get().getId()
                );
            }

            log.info("Venue data initialization completed.");
        } else {
            log.info("Venues already exist, skipping initialization.");
        }
    }
}