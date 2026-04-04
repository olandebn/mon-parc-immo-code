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
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    // PUBLIC - Récupérer les dates déjà réservées (pour le calendrier)
    @GetMapping("/unavailable-dates")
    public ResponseEntity<List<Map<String, String>>> getUnavailableDates() {
        return ResponseEntity.ok(reservationService.getUnavailableDates());
    }

    // AUTHENTIFIÉ - Créer une réservation
    @PostMapping
    public ResponseEntity<Reservation> createReservation(
            @RequestBody Reservation reservation,
            Authentication auth) {
        String clientUid = (String) auth.getPrincipal();
        Reservation created = reservationService.createReservation(reservation, clientUid);
        return ResponseEntity.ok(created);
    }

    // AUTHENTIFIÉ - Voir ses propres réservations
    @GetMapping("/my")
    public ResponseEntity<List<Reservation>> getMyReservations(Authentication auth) {
        String clientUid = (String) auth.getPrincipal();
        return ResponseEntity.ok(reservationService.getReservationsByClient(clientUid));
    }

    // AUTHENTIFIÉ - Voir une réservation spécifique
    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservation(
            @PathVariable String id,
            Authentication auth) {
        String clientUid = (String) auth.getPrincipal();
        Reservation reservation = reservationService.getReservationById(id, clientUid);
        return ResponseEntity.ok(reservation);
    }

    // AUTHENTIFIÉ - Annuler une réservation
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Reservation> cancelReservation(
            @PathVariable String id,
            Authentication auth) {
        String clientUid = (String) auth.getPrincipal();
        Reservation cancelled = reservationService.cancelReservation(id, clientUid);
        return ResponseEntity.ok(cancelled);
    }

    // ADMIN - Voir toutes les réservations
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    // ADMIN - Confirmer une réservation
    @PatchMapping("/admin/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reservation> confirmReservation(@PathVariable String id) {
        return ResponseEntity.ok(reservationService.confirmReservation(id));
    }

    // ADMIN - Ajouter une note interne
    @PatchMapping("/admin/{id}/notes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reservation> addAdminNote(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(reservationService.addAdminNote(id, body.get("notes")));
    }
}
