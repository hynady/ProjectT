package com.ticket.servermono.ticketcontext.infrastructure.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import com.ticket.servermono.ticketcontext.entities.PaymentInfo;
import com.ticket.servermono.ticketcontext.infrastructure.repositories.PaymentInfoRepository;

@Configuration
public class PaymentInfoDataInitializer {

    @Bean
    @Order(3)
    CommandLineRunner initPaymentInfoData(PaymentInfoRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                PaymentInfo defaultPaymentInfo = PaymentInfo.builder()
                        .soTaiKhoan("1234567890")
                        .nganHang("TECHCOMBANK")
                        .isActive(true)
                        .build();
                
                repository.save(defaultPaymentInfo);
            }
        };
    }
}