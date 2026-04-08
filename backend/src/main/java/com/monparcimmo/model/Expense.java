package com.monparcimmo.model;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Expense {
    private String id;
    private String propertyId;      // ID du bien concerné
    private String category;        // RENOVATION, FURNITURE, TAXES, WATER_ELECTRICITY,
                                    // SYNDICATE_CHARGES, INSURANCE, OTHER
    private String label;           // Description de la dépense
    private double amount;          // Montant
    private String currency;        // EUR
    private String frequency;       // ONE_TIME, MONTHLY, ANNUAL
    private LocalDate date;         // Date de la dépense ou début de période
    private int year;               // Année pour les stats
    private String notes;
    private LocalDateTime createdAt;
    private String createdByUid;
}
