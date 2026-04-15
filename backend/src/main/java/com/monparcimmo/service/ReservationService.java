package com.monparcimmo.service;

import com.google.cloud.firestore.*;
import com.monparcimmo.model.Reservation;
import com.monparcimmo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private static final String COLLECTION = "reservations";

    @Autowired
    private Firestore firestore;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    // Dates indisponibles pour un bien donné
    public List<Map<String, String>> getUnavailableDates(String propertyId) {
        try {
            List<QueryDocumentSnapshot> docs = firestore.collection(COLLECTION)
                    .whereEqualTo("propertyId", propertyId)
                    .whereIn("status", Arrays.asList("CONFIRMED", "PENDING"))
                    .get().get().getDocuments();

            List<Map<String, String>> unavailable = new ArrayList<>();
            for (QueryDocumentSnapshot doc : docs) {
                Reservation r = doc.toObject(Reservation.class);
                if (r.getCheckInDate() != null && r.getCheckOutDate() != null) {
                    Map<String, String> range = new HashMap<>();
                    range.put("checkIn", r.getCheckInDate().toString());
                    range.put("checkOut", r.getCheckOutDate().toString());
                    unavailable.add(range);
                }
            }
            return unavailable;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la récupération des dates", e);
        }
    }

    public Reservation createReservation(Reservation reservation, String clientUid) {
        try {
            if (!isAvailable(reservation.getPropertyId(), reservation.getCheckInDate(), reservation.getCheckOutDate())) {
                throw new RuntimeException("Ces dates ne sont pas disponibles");
            }

            User client = userService.getUserByUid(clientUid);
            reservation.setClientUid(clientUid);
            reservation.setClientName(client.getFirstName() + " " + client.getLastName());
            reservation.setClientEmail(client.getEmail());
            reservation.setStatus("PENDING");
            reservation.setCreatedAt(LocalDateTime.now());
            reservation.setUpdatedAt(LocalDateTime.now());
            reservation.setCurrency("EUR");

            DocumentReference ref = firestore.collection(COLLECTION).document();
            reservation.setId(ref.getId());
            ref.set(reservation).get();

            // Envoi des emails — en try/catch séparé pour ne pas bloquer la réservation
            try {
                emailService.sendNewReservationNotification(reservation);
                emailService.sendReservationConfirmationToClient(reservation);
            } catch (Exception emailEx) {
                // Email non configuré ou erreur SMTP — on log sans faire échouer la réservation
                System.err.println("[MonParcImmo] Email non envoyé (config manquante ?) : " + emailEx.getMessage());
            }

            return reservation;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la création de la réservation", e);
        }
    }

    public List<Reservation> getReservationsByClient(String clientUid) {
        try {
            return firestore.collection(COLLECTION)
                    .whereEqualTo("clientUid", clientUid)
                    .orderBy("checkInDate", Query.Direction.DESCENDING)
                    .get().get().getDocuments()
                    .stream()
                    .map(doc -> doc.toObject(Reservation.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    public Reservation getReservationById(String id, String clientUid) {
        try {
            DocumentSnapshot doc = firestore.collection(COLLECTION).document(id).get().get();
            if (!doc.exists()) throw new RuntimeException("Réservation introuvable");
            Reservation reservation = doc.toObject(Reservation.class);
            if (!reservation.getClientUid().equals(clientUid)) {
                throw new RuntimeException("Accès non autorisé");
            }
            return reservation;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    public List<Reservation> getAllReservations() {
        try {
            return firestore.collection(COLLECTION)
                    .orderBy("checkInDate", Query.Direction.DESCENDING)
                    .get().get().getDocuments()
                    .stream()
                    .map(doc -> doc.toObject(Reservation.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    // Réservations d'un bien spécifique (admin)
    public List<Reservation> getReservationsByProperty(String propertyId) {
        try {
            return firestore.collection(COLLECTION)
                    .whereEqualTo("propertyId", propertyId)
                    .orderBy("checkInDate", Query.Direction.DESCENDING)
                    .get().get().getDocuments()
                    .stream()
                    .map(doc -> doc.toObject(Reservation.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    public Reservation confirmReservation(String id) {
        try {
            DocumentReference ref = firestore.collection(COLLECTION).document(id);
            ref.update("status", "CONFIRMED", "updatedAt", LocalDateTime.now()).get();
            Reservation reservation = ref.get().get().toObject(Reservation.class);
            try {
                emailService.sendReservationStatusUpdate(reservation, "CONFIRMED");
            } catch (Exception emailEx) {
                System.err.println("[MonParcImmo] Email confirmation non envoyé : " + emailEx.getMessage());
            }
            return reservation;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    public Reservation cancelReservation(String id, String clientUid) {
        try {
            DocumentReference ref = firestore.collection(COLLECTION).document(id);
            Reservation reservation = ref.get().get().toObject(Reservation.class);
            if (!reservation.getClientUid().equals(clientUid)) {
                throw new RuntimeException("Accès non autorisé");
            }
            ref.update("status", "CANCELLED", "updatedAt", LocalDateTime.now()).get();
            reservation.setStatus("CANCELLED");
            return reservation;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    public Reservation addAdminNote(String id, String notes) {
        try {
            DocumentReference ref = firestore.collection(COLLECTION).document(id);
            ref.update("adminNotes", notes, "updatedAt", LocalDateTime.now()).get();
            return ref.get().get().toObject(Reservation.class);
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    private boolean isAvailable(String propertyId, LocalDate checkIn, LocalDate checkOut) {
        List<Map<String, String>> unavailable = getUnavailableDates(propertyId);
        for (Map<String, String> range : unavailable) {
            LocalDate existingIn = LocalDate.parse(range.get("checkIn"));
            LocalDate existingOut = LocalDate.parse(range.get("checkOut"));
            if (checkIn.isBefore(existingOut) && checkOut.isAfter(existingIn)) {
                return false;
            }
        }
        return true;
    }
}
