package com.example.financialmanager.controller;

import com.example.financialmanager.dto.request.TransactionRequest;
import com.example.financialmanager.dto.response.PageResponse;
import com.example.financialmanager.dto.response.SummaryResponse;
import com.example.financialmanager.dto.response.TransactionResponse;
import com.example.financialmanager.entity.User;
import com.example.financialmanager.enums.TransactionType;
import com.example.financialmanager.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<PageResponse<TransactionResponse>> findAll(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String description,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(transactionService.findAll(
                user, type, categoryId, startDate, endDate, description, page, size
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> findById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(transactionService.findById(id, user));
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryResponse> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(transactionService.getSummary(user, startDate, endDate));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.create(request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(transactionService.update(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        transactionService.delete(id, user);
        return ResponseEntity.noContent().build();
    }
}
