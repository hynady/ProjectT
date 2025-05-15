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
            "CASE WHEN o.nextShowDateTime IS NOT NULL THEN CAST(FUNCTION('date', o.nextShowDateTime) AS LocalDate) ELSE NULL END, " + 
            "CASE WHEN o.nextShowDateTime IS NOT NULL THEN CAST(FUNCTION('time', o.nextShowDateTime) AS LocalTime) ELSE NULL END, " +
            "o.venue.location, o.category.name, o.venue.region.name) " +
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

    Optional<OccaDetailInfo> findByOccaId(UUID occaId);
}
