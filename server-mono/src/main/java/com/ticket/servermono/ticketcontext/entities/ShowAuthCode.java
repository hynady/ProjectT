package com.ticket.servermono.ticketcontext.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity for storing authentication codes for shows.
 * These codes are used for verification purposes and are automatically refreshed hourly.
 */
@Entity
@Table(name = "show_auth_codes")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ShowAuthCode extends BaseSQLEntity {

    /**
     * The ID of the show this authentication code belongs to
     */
    @Column(name = "show_id", nullable = false, unique = true)
    private UUID showId;

    /**
     * The authentication code for the show
     */
    @Column(name = "auth_code", nullable = false)
    private String authCode;

    /**
     * When the code was last refreshed
     */
    @Column(name = "last_refreshed", nullable = false)
    private LocalDateTime lastRefreshed;

    /**
     * When the code expires and needs to be refreshed
     */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}
