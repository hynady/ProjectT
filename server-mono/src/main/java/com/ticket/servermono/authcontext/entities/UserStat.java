package com.ticket.servermono.authcontext.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "user_stats")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UserStat extends BaseSQLEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private EndUser user;
    
    @Column(name = "events_attended")
    private int eventsAttended;
    
    @Column(name = "events_organized")
    private int eventsOrganized;
    
    @Column(name = "tickets_purchased")
    private int ticketsPurchased;
    
    @Column(name = "total_spent")
    private BigDecimal totalSpent;

    // Constructor for a new user with default values
    public UserStat(EndUser user) {
        this.user = user;
        this.eventsAttended = 0;
        this.eventsOrganized = 0;
        this.ticketsPurchased = 0;
        this.totalSpent = BigDecimal.ZERO;
    }
}
