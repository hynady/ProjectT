package com.ticket.servermono.ticketcontext.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "shows", indexes = {
    @Index(name = "idx_show_occa_id", columnList = "occa_id")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Show extends BaseSQLEntity {

    @Column(name = "occa_id", nullable = false)
    private UUID occaId;

    @Column(name = "date", nullable = false)
    private String date;

    @Column(name = "time", nullable = false)
    private String time;

    /**
     * The total number of seats available for this show.
     * This field represents the maximum capacity of attendees that can be accommodated.
     * Must not be null.
     */
    @Column(name = "total_seats", nullable = false)
    private Integer numberOfSeats;

    @OneToMany(mappedBy = "show", cascade = CascadeType.ALL)
    private List<Ticket> tickets;
}