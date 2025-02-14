package com.ticket.servermono.occacontext.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "occa", indexes = {
    @Index(name = "idx_occa_title_location", columnList = "title,location"),
    @Index(name = "idx_occa_category", columnList = "category_id"),
    @Index(name = "idx_occa_venue", columnList = "venue_id"),
    @Index(name = "idx_occa_date", columnList = "date")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Occa extends BaseSQLEntity {

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String image;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private String time;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    private Venue venue;
}
