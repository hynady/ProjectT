package com.ticket.servermono.occacontext.usecases;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ticket.servermono.occacontext.adapters.dtos.CategoryResponse;
import com.ticket.servermono.occacontext.entities.Category;
import com.ticket.servermono.occacontext.infrastructure.repositories.CategoryRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryServices {
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategoriesWithCount() {
        return categoryRepository.findAllCategoriesWithCount();
    }

    @Transactional(readOnly = true)
    public Category getCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    @Transactional
    public Category createCategory(String name) {
        // Check if category already exists
        if (categoryRepository.findByName(name).isPresent()) {
            throw new RuntimeException("Category already exists with name: " + name);
        }
        
        Category category = Category.builder()
                .name(name)
                .build();
        
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(UUID id, String name) {
        Category category = getCategoryById(id);
        
        // Check if another category exists with the same name
        categoryRepository.findByName(name)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new RuntimeException("Category already exists with name: " + name);
                });
        
        category.setName(name);
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = getCategoryById(id);
        
        // Check if category has any events
        if (!category.getOccas().isEmpty()) {
            throw new RuntimeException("Cannot delete category. It has " + category.getOccas().size() + " events associated with it.");
        }
        
        categoryRepository.delete(category);
    }
}
