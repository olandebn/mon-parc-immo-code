package com.monparcimmo.service;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.monparcimmo.model.Property;
import com.monparcimmo.model.Reservation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Scheduler qui tourne chaque matin à 9h.
 * Il cherche toutes les réservations dont le check-in est dans exactement 3 jours
 * et envoie un email de rappel au voyageur avec les instructions d'arrivée.
 */
@Component
public class ReminderScheduler {

    @Autowired
    private Firestore firestore;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PropertyService propertyService;

    // Tous les jours à 9h00
    @Scheduled(cron = "0 0 9 * * *")
    public void sendArrivalReminders() {
        LocalDate in3Days = LocalDate.now().plusDays(3);
        String targetDate = in3Days.toString(); // "2024-07-15"

        try {
            List<QueryDocumentSnapshot> docs = firestore.collection("reservations")
                    .whereEqualTo("checkInDate", targetDate)
                    .whereEqualTo("status", "CONFIRMED")
                    .get().get().getDocuments();

            for (QueryDocumentSnapshot doc : docs) {
                Reservation reservation = doc.toObject(Reservation.class);
                if (reservation.getClientEmail() == null || reservation.getClientEmail().isBlank()) continue;

                // Récupérer les instructions du bien
                String instructions = null;
                String wifiPassword = null;
                try {
                    Property property = propertyService.getPropertyById(reservation.getPropertyId());
                    instructions = property.getCheckInInstructions();
                    wifiPassword = property.getWifiPassword() != null
                            ? (property.getWifiName() != null
                                ? property.getWifiName() + " — " + property.getWifiPassword()
                                : property.getWifiPassword())
                            : null;
                } catch (Exception ignored) {}

                try {
                    emailService.sendArrivalReminder(reservation, instructions, wifiPassword);
                    System.out.println("[Reminder] Email envoyé à " + reservation.getClientEmail() + " pour le " + targetDate);
                } catch (Exception e) {
                    System.err.println("[Reminder] Échec email pour " + reservation.getClientEmail() + " : " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("[Reminder] Erreur scheduler : " + e.getMessage());
        }
    }
}
