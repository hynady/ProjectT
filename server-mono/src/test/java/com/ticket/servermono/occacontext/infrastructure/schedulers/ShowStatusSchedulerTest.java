package com.ticket.servermono.occacontext.infrastructure.schedulers;

import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ticket.servermono.occacontext.domain.enums.SaleStatus;
import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.entities.Show;
import com.ticket.servermono.occacontext.infrastructure.repositories.ShowRepository;

@ExtendWith(MockitoExtension.class)
public class ShowStatusSchedulerTest {

    @Mock
    private ShowRepository showRepository;

    @InjectMocks
    private ShowStatusScheduler scheduler;

    private Show pastShow;
    private Show futureShow;
    private Show todayPastTimeShow;
    private Show todayFutureTimeShow;

    @BeforeEach
    void setUp() {
        // Create test shows
        Occa mockOcca = mock(Occa.class);
        
        // Past show (yesterday)
        pastShow = Show.builder()
                .occa(mockOcca)
                .date(LocalDate.now().minusDays(1))
                .time(LocalTime.of(10, 0))
                .saleStatus(SaleStatus.ON_SALE)
                .autoUpdateStatus(true)
                .build();
        
        // Future show (tomorrow)
        futureShow = Show.builder()
                .occa(mockOcca)
                .date(LocalDate.now().plusDays(1))
                .time(LocalTime.of(10, 0))
                .saleStatus(SaleStatus.ON_SALE)
                .autoUpdateStatus(true)
                .build();
        
        // Today but past time
        todayPastTimeShow = Show.builder()
                .occa(mockOcca)
                .date(LocalDate.now())
                .time(LocalTime.of(0, 0)) // Set to midnight to ensure it's in the past
                .saleStatus(SaleStatus.ON_SALE)
                .autoUpdateStatus(true)
                .build();
        
        // Today but future time
        todayFutureTimeShow = Show.builder()
                .occa(mockOcca)
                .date(LocalDate.now())
                .time(LocalTime.of(23, 59)) // Set to end of day to ensure it's in the future
                .saleStatus(SaleStatus.ON_SALE)
                .autoUpdateStatus(true)
                .build();
    }

    @Test
    void whenUpdateShowStatuses_thenOnlyUpdatePastShows() {
        // Arrange
        List<Show> shows = Arrays.asList(pastShow, futureShow, todayPastTimeShow, todayFutureTimeShow);
        when(showRepository.findByAutoUpdateStatusTrueAndSaleStatusNot(SaleStatus.ENDED)).thenReturn(shows);
        
        // Act
        scheduler.updateShowStatuses();
        
        // Assert
        verify(showRepository).findByAutoUpdateStatusTrueAndSaleStatusNot(SaleStatus.ENDED);
        
        // Verify that pastShow and todayPastTimeShow were updated to ENDED
        assertEquals(SaleStatus.ENDED, pastShow.getSaleStatus());
        assertEquals(SaleStatus.ENDED, todayPastTimeShow.getSaleStatus());
        
        // Verify that futureShow and todayFutureTimeShow were not updated
        assertEquals(SaleStatus.ON_SALE, futureShow.getSaleStatus());
        assertEquals(SaleStatus.ON_SALE, todayFutureTimeShow.getSaleStatus());
        
        // Verify saveAll was called with the updated shows
        verify(showRepository).saveAll(shows);
    }
    
    @Test
    void whenNoShowsNeedUpdating_thenNoSaveAllCall() {
        // Arrange
        List<Show> shows = Arrays.asList(futureShow, todayFutureTimeShow);
        when(showRepository.findByAutoUpdateStatusTrueAndSaleStatusNot(SaleStatus.ENDED)).thenReturn(shows);
        
        // Act
        scheduler.updateShowStatuses();
        
        // Assert
        verify(showRepository).findByAutoUpdateStatusTrueAndSaleStatusNot(SaleStatus.ENDED);
        
        // Verify shows were not updated
        assertEquals(SaleStatus.ON_SALE, futureShow.getSaleStatus());
        assertEquals(SaleStatus.ON_SALE, todayFutureTimeShow.getSaleStatus());
        
        // Verify saveAll was not called since no shows were updated
        verify(showRepository, never()).saveAll(any());
    }
    
    @Test
    void whenAutoUpdateDisabled_thenShowIsNotIncluded() {
        // Arrange
        pastShow.setAutoUpdateStatus(false);
        List<Show> shows = Arrays.asList(futureShow, todayFutureTimeShow);
        when(showRepository.findByAutoUpdateStatusTrueAndSaleStatusNot(SaleStatus.ENDED)).thenReturn(shows);
        
        // Act
        scheduler.updateShowStatuses();
        
        // Assert
        // Verify the repository only returned shows with autoUpdateStatus = true
        verify(showRepository).findByAutoUpdateStatusTrueAndSaleStatusNot(SaleStatus.ENDED);
        
        // Verify pastShow was not included and thus not updated
        assertEquals(SaleStatus.ON_SALE, pastShow.getSaleStatus());
    }
    
    private static void assertEquals(Object expected, Object actual) {
        if (!expected.equals(actual)) {
            throw new AssertionError("Expected: " + expected + ", but was: " + actual);
        }
    }
}
