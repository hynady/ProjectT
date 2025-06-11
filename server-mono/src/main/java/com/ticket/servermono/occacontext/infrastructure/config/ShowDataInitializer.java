// package com.ticket.servermono.occacontext.infrastructure.config;

// import com.ticket.servermono.occacontext.domain.enums.SaleStatus;
// import com.ticket.servermono.occacontext.entities.Occa;
// import com.ticket.servermono.occacontext.entities.Show;
// import com.ticket.servermono.occacontext.infrastructure.repositories.OccaRepository;
// import com.ticket.servermono.occacontext.infrastructure.repositories.ShowRepository;
// import com.ticket.servermono.occacontext.usecases.ShowServices;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.boot.CommandLineRunner;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.core.annotation.Order;

// import java.time.LocalDate;
// import java.time.LocalTime;
// import java.util.ArrayList;
// import java.util.List;
// import java.util.Random;

// @Configuration
// @Slf4j
// public class ShowDataInitializer {

//     private final Random random = new Random();

//     @Bean
//     @Order(4) // Run after OccaDataInitializer which is Order(2)
//     CommandLineRunner initShowData(ShowRepository showRepository, OccaRepository occaRepository, ShowServices showServices) {
//         return args -> {
//             if (showRepository.count() == 0) {
//                 log.info("Starting Show data initialization");
                
//                 // Lấy tất cả Occa từ database
//                 List<Occa> occasions = occaRepository.findAll();
//                 if (occasions.isEmpty()) {
//                     log.warn("No Occa entities found, skipping Show initialization");
//                     return;
//                 }

//                 List<Show> shows = new ArrayList<>();

//                 // Tạo show cho mỗi occa
//                 for (Occa occa : occasions) {
//                     // Tạo 1-4 show cho mỗi occa
//                     int showCount = random.nextInt(4) + 1;
                    
//                     for (int i = 0; i < showCount; i++) {
//                         // Tạo ngày giờ show
//                         LocalDate currentDate = LocalDate.now();
//                         LocalDate showDate = currentDate.plusDays(random.nextInt(90) + 1); // Show trong 90 ngày tới
                        
//                         int hour = random.nextInt(6) + 17; // Giờ từ 17-22
//                         LocalDate date = showDate;
//                         LocalTime time = LocalTime.of(hour, 0);
                        
//                         // Xác định SaleStatus dựa trên ngẫu nhiên
//                         SaleStatus saleStatus;
//                         int statusRandom = random.nextInt(10);
//                         if (statusRandom < 6) {
//                             // 60% là ON_SALE
//                             saleStatus = SaleStatus.ON_SALE;
//                         } else if (statusRandom < 8) {
//                             // 20% là UPCOMING
//                             saleStatus = SaleStatus.UPCOMING;
//                         } else if (statusRandom < 9) {
//                             // 10% là SOLD_OUT
//                             saleStatus = SaleStatus.SOLD_OUT;
//                         } else {
//                             // 10% là ENDED
//                             saleStatus = SaleStatus.ENDED;
//                             // Nếu là ENDED, đặt ngày trong quá khứ
//                             date = currentDate.minusDays(random.nextInt(30) + 1);
//                         }
                        
//                         // Tạo đối tượng Show
//                         Show show = Show.builder()
//                                 .date(date)
//                                 .time(time)
//                                 .occa(occa)
//                                 .saleStatus(saleStatus)
//                                 .build();
                        
//                         shows.add(show);
//                     }
//                 }
                
//                 // Lưu tất cả show vào database
//                 List<Show> savedShows = showRepository.saveAll(shows);
//                 log.info("Saved {} Show entities with SaleStatus", savedShows.size());
                
//                 // Khởi tạo ticket class cho mỗi show qua Kafka
//                 for (Show show : savedShows) {
//                     try {
//                         // Gọi phương thức gửi Kafka message để tạo ticket classes
//                         showServices.initializeTicketClasses(show.getId());
//                         log.info("Sent Kafka message to initialize ticket classes for Show ID: {}", show.getId());
//                     } catch (Exception e) {
//                         log.error("Error sending Kafka message for ticket class initialization, Show ID: {}", show.getId(), e);
//                     }
//                 }
                
//                 log.info("Show data initialization completed");
//             } else {
//                 log.info("Show data already exists, skipping initialization");
//             }
//         };
//     }
// }