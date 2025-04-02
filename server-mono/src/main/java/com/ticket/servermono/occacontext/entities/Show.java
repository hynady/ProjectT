package com.ticket.servermono.occacontext.entities;

import java.time.LocalDate;
import java.time.LocalTime;

import com.ticket.servermono.occacontext.domain.enums.SaleStatus;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "shows", indexes = {
    @Index(name = "idx_show_occa_id", columnList = "occa_id")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@EntityListeners(ShowListener.class)
public class Show extends BaseSQLEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "occa_id", nullable = false)
    private Occa occa;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "time", nullable = false)
    private LocalTime time;

    @Enumerated(EnumType.STRING)
    @Column(name = "sale_status")
    private SaleStatus saleStatus; // UPCOMING, ON_SALE, SOLD_OUT, ENDED
}