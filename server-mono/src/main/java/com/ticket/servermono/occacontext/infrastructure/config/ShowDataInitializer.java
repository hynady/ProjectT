package com.ticket.servermono.occacontext.infrastructure.config;

import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.entities.Show;
import com.ticket.servermono.occacontext.infrastructure.repositories.OccaRepository;
import com.ticket.servermono.occacontext.infrastructure.repositories.ShowRepository;
import com.ticket.servermono.occacontext.usecases.ShowServices;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Configuration
@Slf4j
public class ShowDataInitializer {

    private final Random random = new Random();

    @Bean
    @Order(3) // Run after OccaDataInitializer which is Order(2)
    CommandLineRunner initShowData(ShowRepository showRepository, OccaRepository occaRepository, ShowServices showServices) {
        return args -> {
            if (showRepository.count() == 0) {
                log.info("Starting Show data initialization");
                
                // Lấy tất cả Occa từ database
                List<Occa> occasions = occaRepository.findAll();
                if (occasions.isEmpty()) {
                    log.warn("No Occa entities found, skipping Show initialization");
                    return;
                }

                List<Show> shows = new ArrayList<>();

                // Tạo show cho mỗi occa
                for (Occa occa : occasions) {
                    // Tạo 1-4 show cho mỗi occa
                    int showCount = random.nextInt(4) + 1;
                    
                    for (int i = 0; i < showCount; i++) {
                        // Tạo ngày giờ show
                        LocalDate currentDate = LocalDate.now();
                        LocalDate showDate = currentDate.plusDays(random.nextInt(90) + 1); // Show trong 90 ngày tới
                        
                        int hour = random.nextInt(6) + 17; // Giờ từ 17-22
                        String date = showDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                        String time = String.format("%02d:00", hour);
                        
                        // Tạo đối tượng Show
                        Show show = Show.builder()
                                .date(date)
                                .time(time)
                                .occa(occa)
                                .build();
                        
                        shows.add(show);
                    }
                }
                
                // Lưu tất cả show vào database
                List<Show> savedShows = showRepository.saveAll(shows);
                log.info("Saved {} Show entities", savedShows.size());
                
                // Khởi tạo ticket class cho mỗi show qua Kafka
                for (Show show : savedShows) {
                    try {
                        // Gọi phương thức gửi Kafka message để tạo ticket classes
                        showServices.initializeTicketClasses(show.getId());
                        log.info("Sent Kafka message to initialize ticket classes for Show ID: {}", show.getId());
                    } catch (Exception e) {
                        log.error("Error sending Kafka message for ticket class initialization, Show ID: {}", show.getId(), e);
                    }
                }
                
                log.info("Show data initialization completed");
            } else {
                log.info("Show data already exists, skipping initialization");
            }
        };
    }
}