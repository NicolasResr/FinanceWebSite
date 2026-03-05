package com.example.financialmanager.dto.response;

import com.example.financialmanager.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private TransactionType type;
    private String color;
    private String icon;
    private LocalDateTime createdAt;
}
