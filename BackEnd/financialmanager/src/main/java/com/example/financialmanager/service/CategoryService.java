package com.example.financialmanager.service;

import com.example.financialmanager.dto.request.CategoryRequest;
import com.example.financialmanager.dto.response.CategoryResponse;
import com.example.financialmanager.entity.Category;
import com.example.financialmanager.entity.User;
import com.example.financialmanager.enums.TransactionType;
import com.example.financialmanager.exception.BusinessException;
import com.example.financialmanager.exception.ResourceNotFoundException;
import com.example.financialmanager.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> findAll(User user, TransactionType type) {
        List<Category> categories = type != null
                ? categoryRepository.findByUserIdAndType(user.getId(), type)
                : categoryRepository.findByUserId(user.getId());

        return categories.stream().map(this::toResponse).toList();
    }

    public CategoryResponse findById(Long id, User user) {
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request, User user) {
        if (categoryRepository.existsByNameAndUserId(request.getName(), user.getId())) {
            throw new BusinessException("Category with this name already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .type(request.getType())
                .color(request.getColor())
                .icon(request.getIcon())
                .user(user)
                .build();

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request, User user) {
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        boolean nameChanged = !category.getName().equals(request.getName());
        if (nameChanged && categoryRepository.existsByNameAndUserId(request.getName(), user.getId())) {
            throw new BusinessException("Category with this name already exists");
        }

        category.setName(request.getName());
        category.setType(request.getType());
        category.setColor(request.getColor());
        category.setIcon(request.getIcon());

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id, User user) {
        Category category = categoryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        categoryRepository.delete(category);
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .color(category.getColor())
                .icon(category.getIcon())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
