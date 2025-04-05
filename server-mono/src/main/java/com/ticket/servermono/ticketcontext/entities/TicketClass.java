package com.ticket.servermono.ticketcontext.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ticket_classes")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TicketClass extends BaseSQLEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;
    @Column(name = "locked_capacity", nullable = false)
    
    @Builder.Default
    private Integer lockedCapacity = 0;

    @Column(name = "show_id", nullable = false)
    private UUID showId;

    @OneToMany(mappedBy = "ticketClass", cascade = CascadeType.ALL)
    private List<Ticket> tickets;
}