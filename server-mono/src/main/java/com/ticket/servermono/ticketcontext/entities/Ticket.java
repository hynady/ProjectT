package com.ticket.servermono.ticketcontext.entities;

import java.util.UUID;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "tickets",
    indexes = {
            @Index(name = "idx_ticket_end_user_id", columnList = "end_user_id")
    }
)
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Ticket extends BaseSQLEntity {

    @ManyToOne
    @JoinColumn(name = "ticket_class_id", nullable = false)
    private TicketClass ticketClass;

    @Column(name = "end_user_id", nullable = true)
    private UUID endUserId;

    public Ticket(TicketClass ticketClass) {
        this.ticketClass = ticketClass;
    }
}