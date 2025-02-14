package com.ticket.servermono.occacontext.infrastructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ticket.servermono.occacontext.entities.Occa;
import com.ticket.servermono.occacontext.adapters.dtos.OccaResponse;
import com.ticket.servermono.occacontext.adapters.dtos.SearchBarTemplateResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface OccaRepository extends JpaRepository<Occa, UUID> {
       // TODO: Add logic optimized for user all below methods

       @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.OccaResponse(" +
              "o.id, o.title, o.image, o.date, o.time, o.location, o.price, " +
              "o.category.id, o.venue.id) " +
              "FROM Occa o " +
              "ORDER BY o.id DESC")
       List<OccaResponse> findFirst6HeroOccas(Pageable pageable);

       @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.OccaResponse(" +
              "o.id, o.title, o.image, o.date, o.time, o.location, o.price, " +
              "o.category.id, o.venue.id) " +
              "FROM Occa o " +
              "ORDER BY o.id DESC")
       List<OccaResponse> findFirst6UpcomingOccas(Pageable pageable);

       @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.OccaResponse(" +
              "o.id, o.title, o.image, o.date, o.time, o.location, o.price, " +
              "o.category.id, o.venue.id) " +
              "FROM Occa o " +
              "ORDER BY o.id DESC")
       List<OccaResponse> findFirst3RecommendedOccas(Pageable pageable);

       @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.OccaResponse(" +
              "o.id, o.title, o.image, o.date, o.time, o.location, o.price, " +
              "o.category.id, o.venue.id) " +
              "FROM Occa o " +
              "ORDER BY o.id DESC")
       List<OccaResponse> findFirst3TrendingOccas(Pageable pageable);

       @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.SearchBarTemplateResponse(" +
              "o.id, o.title, o.date, o.location) " +
              "FROM Occa o " +
              "WHERE LOWER(o.title) LIKE %:query% " +
              "   OR LOWER(o.location) LIKE %:query% " +
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

       // Phương thức tiện ích để thiết lập các tham số tìm kiếm
       default List<SearchBarTemplateResponse> searchOccasForSearchBar(String query, Pageable pageable) {
              String lowercaseQuery = query.toLowerCase();
              return searchOccasForSearchBar(
                     lowercaseQuery,
                     lowercaseQuery + "%",
                     pageable
              );
       }

       // @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.OccaResponse(" +
       // "o.id, o.title, o.image, o.date, o.time, o.location, o.price, " +
       // "o.category.id, o.venue.id) " +
       // "FROM Occa o " +
       // "WHERE (:keyword IS NULL OR " +
       // "      LOWER(o.title) LIKE CONCAT('%',:keyword,'%') OR " +
       // "      LOWER(o.location) LIKE CONCAT('%',:keyword,'%')) " +
       // "AND (:categoryId IS NULL OR o.category.id = :categoryId) " +
       // "AND (:venueId IS NULL OR o.venue.id = :venueId) " +
       // "ORDER BY " +
       // "CASE WHEN :sortBy = 'date' THEN o.date " +
       // "     WHEN :sortBy = 'price' THEN CAST(REPLACE(REPLACE(o.price, '$', ''), ',', '') AS double) " +
       // "     WHEN :sortBy = 'title' THEN o.title " +
       // "     ELSE o.date END " +
       // ":sortOrder")
       // List<OccaResponse> searchOccas(
       // @Param("keyword") String keyword,
       // @Param("categoryId") UUID categoryId, 
       // @Param("venueId") UUID venueId,
       // @Param("sortBy") String sortBy,
       // @Param("sortOrder") String sortOrder,
       // Pageable pageable
       // );

       @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.OccaResponse(" +
       "o.id, o.title, o.image, o.date, o.time, o.location, o.price, " +
       "o.category.id, o.venue.id) " +
       "FROM Occa o " +
       "WHERE (:keyword IS NULL OR " +
       "       LOWER(o.title) LIKE CONCAT('%', :keyword, '%') OR " +
       "       LOWER(o.location) LIKE CONCAT('%', :keyword, '%')) " +
       "AND (:categoryId IS NULL OR o.category.id = :categoryId) " +
       "AND (:venueId IS NULL OR o.venue.id = :venueId)")
       Page<OccaResponse> searchOccas(
           @Param("keyword") String keyword,
           @Param("categoryId") UUID categoryId,
           @Param("venueId") UUID venueId,
           Pageable pageable
       );

       @Query("SELECT COUNT(o) " +
       "FROM Occa o " +
       "WHERE (:keyword IS NULL OR " +
       "      LOWER(o.title) LIKE %:keyword% OR " +
       "      LOWER(o.location) LIKE %:keyword%) " +
       "AND (:categoryId IS NULL OR o.category.id = :categoryId) " +
       "AND (:venueId IS NULL OR o.venue.id = :venueId)")
       long countSearchResults(
       @Param("keyword") String keyword,
       @Param("categoryId") UUID categoryId,
       @Param("venueId") UUID venueId
       );
       
}
