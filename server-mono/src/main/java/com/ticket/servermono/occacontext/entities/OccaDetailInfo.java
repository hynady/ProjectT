package com.ticket.servermono.occacontext.entities;

import java.util.List;

import org.checkerframework.checker.units.qual.C;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "occa_detail_info")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class OccaDetailInfo extends BaseSQLEntity {
    
    @Column(nullable = false, length = 1000)
    private String bannerUrl;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String organizer;

    @ElementCollection
    @Column(name = "gallery_urls", length = 1000)
    private List<String> galleryUrls;

    @OneToOne
    @JoinColumn(name = "occa_id", nullable = false, unique = true)
    private Occa occa;

}
