package com.ticket.servermono.authcontext.usecases;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.servermono.authcontext.entities.EndUser;
import com.ticket.servermono.authcontext.entities.UserStat;
import com.ticket.servermono.authcontext.infrastructure.repositories.EndUserRepository;
import com.ticket.servermono.authcontext.infrastructure.repositories.UserStatRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class StatServicesTest {

    @Mock
    private UserStatRepository userStatRepository;

    @Mock
    private EndUserRepository endUserRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private StatServices statServices;

    @Captor
    private ArgumentCaptor<UserStat> userStatCaptor;

    private UUID userId;
    private EndUser user;
    private UserStat existingUserStat;
    private String message;
    private Map<String, Object> statsMap;

    @BeforeEach
    void setUp() throws Exception {
        userId = UUID.randomUUID();
        user = new EndUser();
        user.setId(userId);
        user.setEmail("test@example.com");
        user.setName("Test User");

        existingUserStat = new UserStat(user);
        existingUserStat.setEventsAttended(5);
        existingUserStat.setTicketsPurchased(10);
        existingUserStat.setTotalSpent(BigDecimal.valueOf(1000.0));

        statsMap = new HashMap<>();
        statsMap.put("userId", userId.toString());
        statsMap.put("totalOccas", 7);
        statsMap.put("totalSpent", 1500.0);
        statsMap.put("totalTickets", 15);

        message = new ObjectMapper().writeValueAsString(statsMap);
    }

    @Test
    void shouldUpdateExistingUserStats() throws Exception {
        // Arrange
        when(objectMapper.readValue(anyString(), eq(Map.class))).thenReturn(statsMap);
        when(userStatRepository.findByUserId(userId)).thenReturn(Optional.of(existingUserStat));

        // Act
        statServices.consumeTicketBookingStats(message);

        // Assert
        verify(userStatRepository).save(userStatCaptor.capture());
        UserStat savedUserStat = userStatCaptor.getValue();
        
        assertEquals(7, savedUserStat.getEventsAttended());
        assertEquals(15, savedUserStat.getTicketsPurchased());
        assertEquals(BigDecimal.valueOf(1500.0), savedUserStat.getTotalSpent());
    }

    @Test
    void shouldCreateNewUserStatsWhenNotExists() throws Exception {
        // Arrange
        when(objectMapper.readValue(anyString(), eq(Map.class))).thenReturn(statsMap);
        when(userStatRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(endUserRepository.findById(userId)).thenReturn(Optional.of(user));

        // Act
        statServices.consumeTicketBookingStats(message);

        // Assert
        verify(userStatRepository).save(userStatCaptor.capture());
        UserStat savedUserStat = userStatCaptor.getValue();
        
        assertEquals(user, savedUserStat.getUser());
        assertEquals(7, savedUserStat.getEventsAttended());
        assertEquals(15, savedUserStat.getTicketsPurchased());
        assertEquals(BigDecimal.valueOf(1500.0), savedUserStat.getTotalSpent());
    }

    @Test
    void shouldHandleInvalidMessage() throws Exception {
        // Arrange
        when(objectMapper.readValue(anyString(), eq(Map.class))).thenThrow(new RuntimeException("Invalid JSON"));

        // Act
        statServices.consumeTicketBookingStats("Invalid message");

        // Assert
        verify(userStatRepository, never()).save(any());
    }

    @Test
    void shouldHandleMissingUserId() throws Exception {
        // Arrange
        Map<String, Object> invalidStatsMap = new HashMap<>(statsMap);
        invalidStatsMap.remove("userId");
        when(objectMapper.readValue(anyString(), eq(Map.class))).thenReturn(invalidStatsMap);

        // Act
        statServices.consumeTicketBookingStats(message);

        // Assert
        verify(userStatRepository, never()).save(any());
    }
}
