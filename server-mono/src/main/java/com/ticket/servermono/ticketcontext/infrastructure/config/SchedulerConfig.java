package com.ticket.servermono.ticketcontext.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Cấu hình cho Spring Scheduler
 */
@Configuration
@EnableScheduling
public class SchedulerConfig {
    // Không cần các phương thức bổ sung
    // Annotation @EnableScheduling đã đủ để kích hoạt scheduling
}