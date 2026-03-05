package com.example.financialmanager.dto.request;

import com.example.financialmanager.enums.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private TransactionType type;

    private String color;

    private String icon;
}
