package com.example.financialmanager.dto.response;

import com.example.financialmanager.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String description;
    private BigDecimal amount;
    private TransactionType type;
    private LocalDate date;
    private String notes;
    private CategoryResponse category;
    private LocalDateTime createdAt;
}
