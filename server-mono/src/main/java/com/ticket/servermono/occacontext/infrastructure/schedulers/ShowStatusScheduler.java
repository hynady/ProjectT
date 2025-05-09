package com.ticket.servermono.occacontext.infrastructure.schedulers;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ticket.servermono.occacontext.domain.enums.SaleStatus;
import com.ticket.servermono.occacontext.entities.Show;
import com.ticket.servermono.occacontext.infrastructure.repositories.ShowRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Scheduler to automatically update show statuses based on date/time
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ShowStatusScheduler {

    private final ShowRepository showRepository;
    
    /**
     * Scheduled job to automatically update show statuses to ENDED if they've passed their date/time
     * Runs every minute (configurable)
     */
    @Scheduled(cron = "0 * * * * *") // Run at the top of every minute
    @Transactional
    public void updateShowStatuses() {
        log.info("Running scheduled show status update job");
        
        // Find shows that have auto-update enabled and are not already ENDED
        List<Show> shows = showRepository.findByAutoUpdateStatusTrueAndSaleStatusNot(SaleStatus.ENDED);
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        int updatedCount = 0;
        
        for (Show show : shows) {
            // Check if the show date/time has passed
            if (show.getDate().isBefore(today) || 
                (show.getDate().isEqual(today) && show.getTime().isBefore(now))) {
                
                log.info("Automatically updating show {} to ENDED status (passed date/time)", show.getId());
                show.setSaleStatus(SaleStatus.ENDED);
                updatedCount++;
            }
        }
        
        if (updatedCount > 0) {
            log.info("Updated {} shows to ENDED status", updatedCount);
            showRepository.saveAll(shows);
        } else {
            log.info("No shows needed status updates");
        }
    }
}
