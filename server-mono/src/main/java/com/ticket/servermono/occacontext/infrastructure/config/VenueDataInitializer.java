package com.ticket.servermono.occacontext.infrastructure.config;

import java.util.Arrays;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ticket.servermono.occacontext.entities.Venue;
import com.ticket.servermono.occacontext.infrastructure.repositories.VenueRepository;

@Configuration
public class VenueDataInitializer {

    @Bean
    CommandLineRunner initVenueData(VenueRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                Venue[] venues = {
                        Venue.builder()
                                .name("Hà Nội")
                                .image("https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/shutterstock1391898416-1646649508378.png")
                                .location("Hà Nội")
                                .build(),
                        Venue.builder()
                                .name("Đà Nẵng")
                                .image("https://vcdn1-dulich.vnecdn.net/2022/06/03/cauvang-1654247842-9403-1654247849.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Swd6JjpStebEzT6WARcoOA")
                                .location("Đà Nẵng")
                                .build(),
                        Venue.builder()
                                .name("Tp. Hồ Chí Minh")
                                .image("https://imgcdn.tapchicongthuong.vn/tcct-media/21/1/3/thanh_pho_hcm.jpg")
                                .location("TP. Hồ Chí Minh")
                                .build(),
                        Venue.builder()
                                .name("Hải Phòng")
                                .image("https://xdcs.cdnchinhphu.vn/446259493575335936/2023/3/31/hai-phong-6-1680234763392125722891.jpg")
                                .location("Hải Phòng")
                                .build()
                };

                repository.saveAll(Arrays.asList(venues));
            }

        };
    }

}
