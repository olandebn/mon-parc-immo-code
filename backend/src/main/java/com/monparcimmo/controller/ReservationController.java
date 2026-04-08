package com.monparcimmo.controller;

import com.monparcimmo.model.Reservation;
import com.monparcimmo.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    // PUBLIC - Dates indisponibles pour un bien
    @GetMapping("/properties/{propertyId}/unavailable-dates")
    public ResponseEntity<List<Map<String, String>>> getUnavailableDates(@PathVariable String propertyId) {
        return ResponseEntity.ok(reservationService.getUnavailableDates(propertyId));
    }

    // AUTHENTIFIÉ - Créer une réservation pour un bien
    @PostMapping("/properties/{propertyId}/reservations")
    public ResponseEntity<Reservation> createReservation(
            @PathVariable String propertyId,
            @RequestBody Reservation reservation,
            Authentication auth) {
        String clientUid = (String) auth.getPrincipal();
        reservation.setPropertyId(propertyId);
        return ResponseEntity.ok(reservationService.createReservation(reservation, clientUid));
    }

    // AUTHENTIFIÉ - Mes réservations (tous biens confondus)
    @GetMapping("/reservations/my")
    public ResponseEntity<List<Reservation>> getMyReservations(Authentication auth) {
        return ResponseEntity.ok(reservationService.getReservationsByClient((String) auth.getPrincipal()));
    }

    // AUTHENTIFIÉ - Détail d'une réservation
    @GetMapping("/reservations/{id}")
    public ResponseEntity<Reservation> getReservation(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(reservationService.getReservationById(id, (String) auth.getPrincipal()));
    }

    // AUTHENTIFIÉ - Annuler une réservation
    @PatchMapping("/reservations/{id}/cancel")
    public ResponseEntity<Reservation> cancelReservation(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(reservationService.cancelReservation(id, (String) auth.getPrincipal()));
    }

    // ADMIN - Toutes les réservations
    @GetMapping("/admin/reservations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    // ADMIN - Réservations d'un bien
    @GetMapping("/admin/properties/{propertyId}/reservations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Reservation>> getReservationsByProperty(@PathVariable String propertyId) {
        return ResponseEntity.ok(reservationService.getReservationsByProperty(propertyId));
    }

    // ADMIN - Confirmer
    @PatchMapping("/admin/reservations/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reservation> confirmReservation(@PathVariable String id) {
        return ResponseEntity.ok(reservationService.confirmReservation(id));
    }

    // ADMIN - Note interne
    @PatchMapping("/admin/reservations/{id}/notes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reservation> addAdminNote(@PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(reservationService.addAdminNote(id, body.get("notes")));
    }
}
