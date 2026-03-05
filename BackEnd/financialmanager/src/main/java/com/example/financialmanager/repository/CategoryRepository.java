package com.example.financialmanager.repository;

import com.example.financialmanager.entity.Category;
import com.example.financialmanager.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserId(Long userId);
    List<Category> findByUserIdAndType(Long userId, TransactionType type);
    Optional<Category> findByIdAndUserId(Long id, Long userId);
    boolean existsByNameAndUserId(String name, Long userId);
}
