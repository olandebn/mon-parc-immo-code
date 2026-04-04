package com.monparcimmo.model;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Reservation {
    private String id;
    private String clientUid;       // Firebase UID du client
    private String clientName;      // Prénom + Nom (dénormalisé)
    private String clientEmail;
    private String clientPhone;

    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private int numberOfGuests;

    // Tarification
    private String pricingSeasonId; // ID de la saison de tarif appliquée
    private String pricingType;     // NIGHTLY, WEEKEND, WEEKLY
    private double totalPrice;
    private String currency;        // EUR

    // Statut
    private String status;          // PENDING, CONFIRMED, CANCELLED, COMPLETED

    // Métadonnées
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String notes;           // Notes du client lors de la réservation
    private String adminNotes;      // Notes internes de l'admin
}
