package com.ticket.servermono.occacontext.infrastructure.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import com.ticket.servermono.occacontext.entities.Category;
import com.ticket.servermono.occacontext.infrastructure.repositories.CategoryRepository;

import java.util.Arrays;
@Configuration
public class CategoryDataInitializer {

    @Bean
    @Order(2) 
    CommandLineRunner initCategoryData(CategoryRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                Category[] categories = {
                    new Category("Âm nhạc"),
                    new Category("Phim ảnh"),
                    new Category("Thể thao"),
                    new Category("Sân khấu"),
                    new Category("Lễ hội"),
                    new Category("Hội thảo"),
                    new Category("Trải nghiệm"),
                    new Category("Giải trí")
                };
                repository.saveAll(Arrays.asList(categories));
            }
        };
    }
}