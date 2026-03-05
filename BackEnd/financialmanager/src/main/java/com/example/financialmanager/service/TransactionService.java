package com.example.financialmanager.service;

import com.example.financialmanager.dto.request.TransactionRequest;
import com.example.financialmanager.dto.response.PageResponse;
import com.example.financialmanager.dto.response.SummaryResponse;
import com.example.financialmanager.dto.response.TransactionResponse;
import com.example.financialmanager.entity.Category;
import com.example.financialmanager.entity.Transaction;
import com.example.financialmanager.entity.User;
import com.example.financialmanager.enums.TransactionType;
import com.example.financialmanager.exception.BusinessException;
import com.example.financialmanager.exception.ResourceNotFoundException;
import com.example.financialmanager.repository.CategoryRepository;
import com.example.financialmanager.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public PageResponse<TransactionResponse> findAll(
            User user,
            TransactionType type,
            Long categoryId,
            LocalDate startDate,
            LocalDate endDate,
            String description,
            int page,
            int size
    ) {
        Page<Transaction> result = transactionRepository.findAllWithFilters(
                user.getId(), type, categoryId, startDate, endDate, description,
                PageRequest.of(page, size)
        );

        return PageResponse.<TransactionResponse>builder()
                .content(result.getContent().stream().map(this::toResponse).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    public TransactionResponse findById(Long id, User user) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return toResponse(transaction);
    }

    @Transactional
    public TransactionResponse create(TransactionRequest request, User user) {
        Category category = resolveCategory(request.getCategoryId(), request.getType(), user);

        Transaction transaction = Transaction.builder()
                .description(request.getDescription())
                .amount(request.getAmount())
                .type(request.getType())
                .date(request.getDate())
                .notes(request.getNotes())
                .category(category)
                .user(user)
                .build();

        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponse update(Long id, TransactionRequest request, User user) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        Category category = resolveCategory(request.getCategoryId(), request.getType(), user);

        transaction.setDescription(request.getDescription());
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setDate(request.getDate());
        transaction.setNotes(request.getNotes());
        transaction.setCategory(category);

        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public void delete(Long id, User user) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        transactionRepository.delete(transaction);
    }

    public SummaryResponse getSummary(User user, LocalDate startDate, LocalDate endDate) {
        BigDecimal totalIncome = transactionRepository.sumByUserIdAndType(
                user.getId(), TransactionType.INCOME, startDate, endDate);
        BigDecimal totalExpense = transactionRepository.sumByUserIdAndType(
                user.getId(), TransactionType.EXPENSE, startDate, endDate);

        totalIncome = totalIncome != null ? totalIncome : BigDecimal.ZERO;
        totalExpense = totalExpense != null ? totalExpense : BigDecimal.ZERO;

        return SummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(totalIncome.subtract(totalExpense))
                .build();
    }

    private Category resolveCategory(Long categoryId, TransactionType type, User user) {
        if (categoryId == null) return null;

        Category category = categoryRepository.findByIdAndUserId(categoryId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (category.getType() != type) {
            throw new BusinessException("Category type does not match transaction type");
        }

        return category;
    }

    private TransactionResponse toResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .description(transaction.getDescription())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .date(transaction.getDate())
                .notes(transaction.getNotes())
                .category(transaction.getCategory() != null ? toCategoryResponse(transaction.getCategory()) : null)
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    private com.example.financialmanager.dto.response.CategoryResponse toCategoryResponse(Category category) {
        return com.example.financialmanager.dto.response.CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .color(category.getColor())
                .icon(category.getIcon())
                .build();
    }
}
