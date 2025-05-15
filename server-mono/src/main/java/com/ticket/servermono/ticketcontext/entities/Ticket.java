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
            @Index(name = "idx_ticket_end_user_id", columnList = "end_user_id"),
            @Index(name = "idx_ticket_invoice_id", columnList = "invoice_id")
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

    @Column(name = "checked_in_at", nullable = true)
    private String checkedInAt;
    
    @ManyToOne
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    public Ticket(TicketClass ticketClass) {
        this.ticketClass = ticketClass;
    }
    
    public Ticket(TicketClass ticketClass, Invoice invoice) {
        this.ticketClass = ticketClass;
        this.invoice = invoice;
    }
}