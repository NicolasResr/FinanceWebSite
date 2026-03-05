package com.example.financialmanager.repository;

import com.example.financialmanager.entity.Transaction;
import com.example.financialmanager.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    @Query("""
        SELECT t FROM Transaction t
        WHERE t.user.id = :userId
        AND (:type IS NULL OR t.type = :type)
        AND (:categoryId IS NULL OR t.category.id = :categoryId)
        AND (:startDate IS NULL OR t.date >= :startDate)
        AND (:endDate IS NULL OR t.date <= :endDate)
        AND (:description IS NULL OR LOWER(t.description) LIKE LOWER(CONCAT('%', :description, '%')))
        ORDER BY t.date DESC, t.createdAt DESC
    """)
    Page<Transaction> findAllWithFilters(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("description") String description,
            Pageable pageable
    );

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
        WHERE t.user.id = :userId
        AND t.type = :type
        AND (:startDate IS NULL OR t.date >= :startDate)
        AND (:endDate IS NULL OR t.date <= :endDate)
    """)
    BigDecimal sumByUserIdAndType(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
