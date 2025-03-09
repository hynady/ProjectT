package com.ticket.servermono.occacontext.infrastructure.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ticket.servermono.occacontext.adapters.dtos.DetailData.OccaHeroDetailResponse;
import com.ticket.servermono.occacontext.adapters.dtos.DetailData.OverviewData;
import com.ticket.servermono.occacontext.entities.OccaDetailInfo;

public interface OccaDetailInfoRepository extends JpaRepository<OccaDetailInfo, UUID> {

    @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.DetailData.OccaHeroDetailResponse(" +
            "o.id, o.title, o.artist, odi.bannerUrl, " +
            "(SELECT MIN(s.date) FROM Show s WHERE s.occa.id = o.id AND s.date >= CURRENT_DATE), " +
            "(SELECT s.time FROM Show s WHERE s.occa.id = o.id AND s.date = " +
            "   (SELECT MIN(s2.date) FROM Show s2 WHERE s2.occa.id = o.id AND s2.date >= CURRENT_DATE) " +
            "   ORDER BY s.time ASC LIMIT 1), " +
            " o.venue.location) " +
            "FROM Occa o " +
            "LEFT JOIN o.detailInfo odi " +
            "WHERE o.id = :occaId")
    Optional<OccaHeroDetailResponse> findHeroDetailById(@Param("occaId") UUID occaId);

    @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.DetailData.OverviewData(" +
            "odi.description, odi.organizer) " +
            "FROM OccaDetailInfo odi " +
            "WHERE odi.occa.id = :occaId")
    Optional<OverviewData> findOverviewById(@Param("occaId") UUID occaId);

    @Query("SELECT odi.galleryUrls FROM OccaDetailInfo odi WHERE odi.occa.id = :occaId")
    Optional<List<String>> findGalleryByOccaId(@Param("occaId") UUID occaId);
}
