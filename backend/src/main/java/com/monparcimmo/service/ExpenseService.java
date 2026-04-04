package com.monparcimmo.service;

import com.google.cloud.firestore.*;
import com.monparcimmo.model.Expense;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private static final String COLLECTION = "expenses";

    @Autowired
    private Firestore firestore;

    public List<Expense> getAllExpenses() {
        try {
            return firestore.collection(COLLECTION)
                    .orderBy("date", Query.Direction.DESCENDING)
                    .get().get().getDocuments()
                    .stream()
                    .map(doc -> doc.toObject(Expense.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    public List<Expense> getExpensesByYear(int year) {
        return getAllExpenses().stream()
                .filter(e -> e.getYear() == year)
                .collect(Collectors.toList());
    }

    public List<Expense> getExpensesByCategory(String category) {
        return getAllExpenses().stream()
                .filter(e -> category.equals(e.getCategory()))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getExpenseSummaryByYear(int year) {
        List<Expense> expenses = getExpensesByYear(year);

        Map<String, Double> byCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.summingDouble(Expense::getAmount)
                ));

        double total = expenses.stream().mapToDouble(Expense::getAmount).sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("year", year);
        summary.put("totalExpenses", total);
        summary.put("byCategory", byCategory);
        summary.put("currency", "EUR");

        return summary;
    }

    public Expense addExpense(Expense expense, String adminUid) {
        try {
            expense.setCreatedAt(LocalDateTime.now());
            expense.setCreatedByUid(adminUid);
            expense.setCurrency("EUR");

            // Définir l'année depuis la date si pas déjà défini
            if (expense.getDate() != null && expense.getYear() == 0) {
                expense.setYear(expense.getDate().getYear());
            }

            DocumentReference ref = firestore.collection(COLLECTION).document();
            expense.setId(ref.getId());
            ref.set(expense).get();
            return expense;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de l'ajout de la dépense", e);
        }
    }

    public Expense updateExpense(String id, Expense expense) {
        try {
            expense.setId(id);
            firestore.collection(COLLECTION).document(id).set(expense).get();
            return expense;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la mise à jour", e);
        }
    }

    public void deleteExpense(String id) {
        try {
            firestore.collection(COLLECTION).document(id).delete().get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la suppression", e);
        }
    }
}
