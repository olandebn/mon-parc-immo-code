package com.monparcimmo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Review {
    private String id;
    private String propertyId;      // ID du bien concerné
    private String reservationId;   // La review est liée à une réservation
    private String clientUid;
    private String clientName;

    // Note globale (1 à 5 étoiles)
    private int overallRating;

    // Notes détaillées
    private int cleanlinessRating;   // Propreté
    private int comfortRating;       // Confort
    private int locationRating;      // Emplacement
    private int communicationRating; // Communication avec l'admin

    private String comment;          // Commentaire libre
    private String adminResponse;    // Réponse de l'admin (optionnelle)

    private LocalDateTime createdAt;
    private boolean visible;         // L'admin peut masquer un avis
}
