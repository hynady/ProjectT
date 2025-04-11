package com.ticket.servermono.occacontext.infrastructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.adapters.dtos.OccaProjection;
import com.ticket.servermono.occacontext.adapters.dtos.SearchBarTemplateResponse;
import com.ticket.servermono.occacontext.adapters.dtos.Booking.OccaForBookingResponse;
import com.ticket.servermono.occacontext.domain.enums.ApprovalStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OccaRepository extends JpaRepository<Occa, UUID> {
        // TODO: Add logic optimized for user all below methods

        // Các phương thức cho organizer API
        Page<Occa> findByApprovalStatus(ApprovalStatus status, Pageable pageable);
        
        Page<Occa> findByApprovalStatusAndTitleContainingIgnoreCase(
                ApprovalStatus status, String title, Pageable pageable);
                
        Page<Occa> findByTitleContainingIgnoreCase(String title, Pageable pageable);
        
        @Query("SELECT o FROM Occa o WHERE " +
               "(:status IS NULL OR o.approvalStatus = :status) AND " +
               "(:search IS NULL OR LOWER(o.title) LIKE CONCAT('%', LOWER(:search), '%'))")
        Page<Occa> findForApprovalManagement(@Param("status") ApprovalStatus status, 
                                            @Param("search") String search, 
                                            Pageable pageable);

        @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.OccaProjection(" +
                        "o.id, o.title, o.image, " +
                        "o.nextShowDateTime, " +
                        "o.venue.location, " +
                        "o.category.id, o.venue.id, " +
                        "o.minPrice) " +
                        "FROM Occa o " +
                        "WHERE EXISTS (SELECT 1 FROM Show s WHERE s.occa.id = o.id) " +
                        "ORDER BY o.id DESC")
        List<OccaProjection> findFirst6HeroOccas(Pageable pageable);

        @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.OccaProjection(" +
                        "o.id, o.title, o.image, " +
                        "o.nextShowDateTime, " +
                        "o.venue.location, " +
                        "o.category.id, o.venue.id, " +
                        "o.minPrice) " +
                        "FROM Occa o " +
                        "WHERE o.nextShowDateTime >= CURRENT_TIMESTAMP " +
                        "ORDER BY o.nextShowDateTime ASC")
        List<OccaProjection> findFirst6UpcomingOccas(Pageable pageable);

        @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.OccaProjection(" +
                        "o.id, o.title, o.image, " +
                        "o.nextShowDateTime, " +
                        "o.venue.location, " +
                        "o.category.id, o.venue.id, " +
                        "o.minPrice) " +
                        "FROM Occa o " +
                        "WHERE EXISTS (SELECT 1 FROM Show s WHERE s.occa.id = o.id) " +
                        "ORDER BY o.id DESC")
        List<OccaProjection> findFirst3RecommendedOccas(Pageable pageable);

        @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.OccaProjection(" +
                        "o.id, o.title, o.image, " +
                        "o.nextShowDateTime, " +
                        "o.venue.location, " +
                        "o.category.id, o.venue.id, " +
                        "o.minPrice) " +
                        "FROM Occa o " +
                        "WHERE EXISTS (SELECT 1 FROM Show s WHERE s.occa.id = o.id) " +
                        "ORDER BY o.id DESC")
        List<OccaProjection> findFirst3TrendingOccas(Pageable pageable);

        @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.SearchBarTemplateResponse(" +
                        "o.id, o.title, " +
                        "o.nextShowDateTime, " +
                        "o.venue.location) " +
                        "FROM Occa o " +
                        "WHERE LOWER(o.title) LIKE %:query% " +
                        "   OR LOWER(o.venue.location) LIKE %:query% " +
                        "   OR LOWER(o.venue.region.name) LIKE %:query% " +
                        "   OR SOUNDEX(o.title) = SOUNDEX(:query) " +
                        "ORDER BY " +
                        "   CASE " +
                        "      WHEN LOWER(o.title) = :query THEN 0 " +
                        "      WHEN LOWER(o.title) LIKE :startQuery THEN 1 " +
                        "      WHEN SOUNDEX(o.title) = SOUNDEX(:query) THEN 2 " +
                        "      ELSE 3 " +
                        "   END, " +
                        "   o.id DESC")
        List<SearchBarTemplateResponse> searchOccasForSearchBar(
                        @Param("query") String query,
                        @Param("startQuery") String startQuery,
                        Pageable pageable);

        // The default method stays the same
        default List<SearchBarTemplateResponse> searchOccasForSearchBar(String query, Pageable pageable) {
                String lowercaseQuery = query.toLowerCase();
                return searchOccasForSearchBar(
                                lowercaseQuery,
                                lowercaseQuery + "%",
                                pageable);
        }

        @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.OccaProjection(" +
                        "o.id, o.title, o.image, " +
                        "o.nextShowDateTime, " +
                        "o.venue.location, " +
                        "o.category.id, o.venue.id, " +
                        "o.minPrice) " +
                        "FROM Occa o " +
                        "WHERE (:keyword IS NULL OR " +
                        "       LOWER(o.title) LIKE CONCAT('%', :keyword, '%') OR " +
                        "       LOWER(o.venue.region.name) LIKE CONCAT('%', :keyword, '%') OR " +
                        "       LOWER(o.venue.location) LIKE CONCAT('%', :keyword, '%')) " +
                        "AND (:categoryId IS NULL OR o.category.id = :categoryId) " +
                        "AND (:regionId IS NULL OR o.venue.region.id = :regionId) " +
                        "AND EXISTS (SELECT 1 FROM Show s WHERE s.occa.id = o.id)")
        Page<OccaProjection> searchOccas(
                        @Param("keyword") String keyword,
                        @Param("categoryId") UUID categoryId,
                        @Param("regionId") UUID regionId,
                        Pageable pageable);

        @Query("SELECT COUNT(o) " +
                        "FROM Occa o " +
                        "WHERE (:keyword IS NULL OR " +
                        "      LOWER(o.title) LIKE %:keyword% OR " +
                        "      LOWER(o.venue.location) LIKE %:keyword%) " +
                        "AND (:categoryId IS NULL OR o.category.id = :categoryId) " +
                        "AND (:venueId IS NULL OR o.venue.id = :venueId)")
        long countSearchResults(
                        @Param("keyword") String keyword,
                        @Param("categoryId") UUID categoryId,
                        @Param("venueId") UUID venueId);

        @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.Booking.OccaForBookingResponse(" +
                        "o.id, o.title, o.venue.address, o.venue.location) " +
                        "FROM Occa o " +
                        "WHERE o.id = :occaId")
        Optional<OccaForBookingResponse> findOccaForBooking(@Param("occaId") UUID occaId);

}