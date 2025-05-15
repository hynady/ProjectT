package com.ticket.servermono.occacontext.infrastructure.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.ticket.servermono.occacontext.infrastructure.repositories.RegionRepository;
import com.ticket.servermono.occacontext.usecases.RegionServices;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
@RequiredArgsConstructor
public class RegionDataInitializer implements CommandLineRunner {

    private final RegionServices regionService;
    private final RegionRepository regionRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing Region data...");

        if (regionRepository.findAll().isEmpty()) {
            // Initialize regions with some sample data
            regionService.createRegion(
                "Hà Nội",
                "https://vietnamdiscovery.com/wp-content/uploads/2020/09/legendary-hanoi-city-tour-1.jpg"
            );

            regionService.createRegion(
                "Hồ Chí Minh",
                "https://lp-cms-production.imgix.net/2021-01/shutterstockRF_718619590.jpg"
            );

            regionService.createRegion(
                "Đà Nẵng",
                "https://toquoc.mediacdn.vn/280518851207290880/2024/1/7/dsdgtdy-1704616308047440689926.jpg"
            );

            log.info("Region data initialization completed.");
        } else {
            log.info("Region data already exists, skipping initialization.");
        }
    }
}