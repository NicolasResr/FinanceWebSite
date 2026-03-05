package com.example.financialmanager.controller;

import com.example.financialmanager.dto.request.CategoryRequest;
import com.example.financialmanager.dto.response.CategoryResponse;
import com.example.financialmanager.entity.User;
import com.example.financialmanager.enums.TransactionType;
import com.example.financialmanager.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> findAll(
            @RequestParam(required = false) TransactionType type,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(categoryService.findAll(user, type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> findById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(categoryService.findById(id, user));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(categoryService.update(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        categoryService.delete(id, user);
        return ResponseEntity.noContent().build();
    }
}
