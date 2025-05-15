package com.ticket.servermono.occacontext.usecases;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ticket.servermono.occacontext.adapters.dtos.CategoryResponse;
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

}
