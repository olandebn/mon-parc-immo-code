package com.monparcimmo.controller;

import com.monparcimmo.model.PricingSeason;
import com.monparcimmo.service.PricingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pricing")
public class PricingController {

    @Autowired
    private PricingService pricingService;

    // PUBLIC - Récupérer toutes les saisons actives (pour afficher les tarifs)
    @GetMapping("/seasons")
    public ResponseEntity<List<PricingSeason>> getActiveSeasons() {
        return ResponseEntity.ok(pricingService.getActiveSeasons());
    }

    // PUBLIC - Calculer le prix pour des dates données
    @GetMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculatePrice(
            @RequestParam String checkIn,
            @RequestParam String checkOut) {
        LocalDate checkInDate = LocalDate.parse(checkIn);
        LocalDate checkOutDate = LocalDate.parse(checkOut);
        Map<String, Object> priceInfo = pricingService.calculatePrice(checkInDate, checkOutDate);
        return ResponseEntity.ok(priceInfo);
    }

    // ADMIN - Lister toutes les saisons
    @GetMapping("/admin/seasons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PricingSeason>> getAllSeasons() {
        return ResponseEntity.ok(pricingService.getAllSeasons());
    }

    // ADMIN - Créer une saison de tarif
    @PostMapping("/admin/seasons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PricingSeason> createSeason(@RequestBody PricingSeason season) {
        return ResponseEntity.ok(pricingService.createSeason(season));
    }

    // ADMIN - Modifier une saison
    @PutMapping("/admin/seasons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PricingSeason> updateSeason(
            @PathVariable String id,
            @RequestBody PricingSeason season) {
        return ResponseEntity.ok(pricingService.updateSeason(id, season));
    }

    // ADMIN - Supprimer une saison
    @DeleteMapping("/admin/seasons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSeason(@PathVariable String id) {
        pricingService.deleteSeason(id);
        return ResponseEntity.noContent().build();
    }
}
