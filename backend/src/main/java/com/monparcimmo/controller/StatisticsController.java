package com.monparcimmo.controller;

import com.monparcimmo.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/statistics")
@PreAuthorize("hasRole('ADMIN')")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    // Statistiques globales pour une année donnée
    @GetMapping("/year/{year}")
    public ResponseEntity<Map<String, Object>> getYearlyStats(@PathVariable int year) {
        return ResponseEntity.ok(statisticsService.getYearlyStatistics(year));
    }

    // Nombre de locations par mois (pour graphique)
    @GetMapping("/bookings-per-month/{year}")
    public ResponseEntity<Map<String, Object>> getBookingsPerMonth(@PathVariable int year) {
        return ResponseEntity.ok(statisticsService.getBookingsPerMonth(year));
    }

    // Revenus vs Dépenses par année
    @GetMapping("/financial/{year}")
    public ResponseEntity<Map<String, Object>> getFinancialSummary(@PathVariable int year) {
        return ResponseEntity.ok(statisticsService.getFinancialSummary(year));
    }

    // Historique complet des clients (liste + leurs réservations)
    @GetMapping("/clients-history")
    public ResponseEntity<Map<String, Object>> getClientsHistory() {
        return ResponseEntity.ok(statisticsService.getClientsWithHistory());
    }

    // Taux d'occupation par année
    @GetMapping("/occupancy-rate/{year}")
    public ResponseEntity<Map<String, Object>> getOccupancyRate(@PathVariable int year) {
        return ResponseEntity.ok(statisticsService.getOccupancyRate(year));
    }
}
