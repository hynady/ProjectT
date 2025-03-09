package com.ticket.servermono.occacontext.entities;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "occa", indexes = {
    @Index(name = "idx_occa_title", columnList = "title"),
    @Index(name = "idx_occa_category", columnList = "category_id"),
    @Index(name = "idx_occa_venue", columnList = "venue_id"),
    @Index(name = "idx_occa_artist", columnList = "artist")
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

    @Column(nullable = true)
    private String artist;

    @Column(name = "next_show_date_time")
    private LocalDateTime nextShowDateTime;

    @Column(name = "min_price")
    private Double minPrice;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @OneToOne(mappedBy = "occa", cascade = CascadeType.ALL)
    private OccaDetailInfo detailInfo;

    @OneToMany(mappedBy = "occa", cascade = CascadeType.ALL)
    private List<Show> shows;
}
