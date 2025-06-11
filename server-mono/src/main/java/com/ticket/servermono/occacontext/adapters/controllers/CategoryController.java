package com.ticket.servermono.occacontext.adapters.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ticket.servermono.occacontext.adapters.dtos.CategoryResponse;
import com.ticket.servermono.occacontext.entities.Category;
import com.ticket.servermono.occacontext.usecases.CategoryServices;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryServices categoryServices;

    @GetMapping
    public ResponseEntity<?> getCategories() {
        try {
            List<CategoryResponse> categories = categoryServices.getAllCategoriesWithCount();
            return ResponseEntity.ok(categories);
        } catch(RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable UUID id) {
        return ResponseEntity.ok(categoryServices.getCategoryById(id));
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(
            @RequestParam String name) {
        return ResponseEntity.ok(categoryServices.createCategory(name));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable UUID id,
            @RequestParam String name) {
        return ResponseEntity.ok(categoryServices.updateCategory(id, name));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        categoryServices.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
