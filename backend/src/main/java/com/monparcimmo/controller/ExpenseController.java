package com.monparcimmo.controller;

import com.monparcimmo.model.Expense;
import com.monparcimmo.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/expenses")
@PreAuthorize("hasRole('ADMIN')")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    // Lister toutes les dépenses
    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    // Lister les dépenses par année
    @GetMapping("/year/{year}")
    public ResponseEntity<List<Expense>> getExpensesByYear(@PathVariable int year) {
        return ResponseEntity.ok(expenseService.getExpensesByYear(year));
    }

    // Lister les dépenses par catégorie
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Expense>> getExpensesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(expenseService.getExpensesByCategory(category));
    }

    // Résumé des dépenses par année (total par catégorie)
    @GetMapping("/summary/{year}")
    public ResponseEntity<Map<String, Object>> getExpenseSummary(@PathVariable int year) {
        return ResponseEntity.ok(expenseService.getExpenseSummaryByYear(year));
    }

    // Ajouter une dépense
    @PostMapping
    public ResponseEntity<Expense> addExpense(
            @RequestBody Expense expense,
            Authentication auth) {
        String adminUid = (String) auth.getPrincipal();
        return ResponseEntity.ok(expenseService.addExpense(expense, adminUid));
    }

    // Modifier une dépense
    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(
            @PathVariable String id,
            @RequestBody Expense expense) {
        return ResponseEntity.ok(expenseService.updateExpense(id, expense));
    }

    // Supprimer une dépense
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable String id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
