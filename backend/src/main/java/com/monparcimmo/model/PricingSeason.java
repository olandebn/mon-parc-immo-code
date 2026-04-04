package com.monparcimmo.model;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PricingSeason {
    private String id;
    private String name;            // ex: "Haute saison été 2025", "Basse saison hiver"
    private String type;            // HIGH_SEASON, LOW_SEASON
    private LocalDate startDate;
    private LocalDate endDate;

    // Tarifs pour cette saison
    private double nightlyRate;     // Prix par nuit
    private double weekendRate;     // Prix pour le week-end (vendredi soir -> dimanche)
    private double weeklyRate;      // Prix à la semaine (7 nuits)

    private boolean active;
    private String notes;           // Notes optionnelles pour l'admin
}
