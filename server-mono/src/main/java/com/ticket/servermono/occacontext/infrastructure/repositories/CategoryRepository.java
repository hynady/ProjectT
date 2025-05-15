package com.ticket.servermono.occacontext.infrastructure.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ticket.servermono.occacontext.adapters.dtos.CategoryResponse;
import com.ticket.servermono.occacontext.entities.Category;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    @Query("SELECT new com.ticket.servermono.occacontext.adapters.dtos.CategoryResponse(" +
            "c.id, c.name, COUNT(o)) " +
            "FROM Category c LEFT JOIN c.occas o " +
            "GROUP BY c.id, c.name")
    List<CategoryResponse> findAllCategoriesWithCount();

    Optional<Category> findFirstByName(String name);

    Optional<Category> findByName(String name);
}
