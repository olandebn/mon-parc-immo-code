package com.monparcimmo.controller;

import com.monparcimmo.model.Property;
import com.monparcimmo.service.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/api")
public class PropertyController {

    @Autowired
    private PropertyService propertyService;

    // ─────────────────────────────────────────────────────────────
    // PUBLIC
    // ─────────────────────────────────────────────────────────────

    // Lister tous les biens
    @GetMapping("/properties")
    public ResponseEntity<List<Property>> getAllProperties() {
        return ResponseEntity.ok(propertyService.getAllProperties());
    }

    // Récupérer un bien
    @GetMapping("/properties/{propertyId}")
    public ResponseEntity<Property> getProperty(@PathVariable String propertyId) {
        return ResponseEntity.ok(propertyService.getPropertyById(propertyId));
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN
    // ─────────────────────────────────────────────────────────────

    // Créer un bien
    @PostMapping("/admin/properties")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Property> createProperty(@RequestBody Property property) {
        return ResponseEntity.ok(propertyService.createProperty(property));
    }

    // Modifier un bien
    @PutMapping("/admin/properties/{propertyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Property> updateProperty(
            @PathVariable String propertyId,
            @RequestBody Property property) {
        return ResponseEntity.ok(propertyService.updateProperty(propertyId, property));
    }

    // Supprimer un bien
    @DeleteMapping("/admin/properties/{propertyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProperty(@PathVariable String propertyId) {
        propertyService.deleteProperty(propertyId);
        return ResponseEntity.noContent().build();
    }

    // Ajouter une photo principale
    @PostMapping("/admin/properties/{propertyId}/photos/main")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Property> addMainPhoto(
            @PathVariable String propertyId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(propertyService.addMainPhoto(propertyId, body.get("url")));
    }

    // Ajouter une photo des alentours
    @PostMapping("/admin/properties/{propertyId}/photos/surrounding")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Property> addSurroundingPhoto(
            @PathVariable String propertyId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(propertyService.addSurroundingPhoto(propertyId, body.get("url")));
    }

    // Supprimer une photo principale
    @DeleteMapping("/admin/properties/{propertyId}/photos/main")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Property> removeMainPhoto(
            @PathVariable String propertyId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(propertyService.removeMainPhoto(propertyId, body.get("url")));
    }

    // Supprimer une photo des alentours
    @DeleteMapping("/admin/properties/{propertyId}/photos/surrounding")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Property> removeSurroundingPhoto(
            @PathVariable String propertyId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(propertyService.removeSurroundingPhoto(propertyId, body.get("url")));
    }

    // Réordonner les photos principales
    @PutMapping("/admin/properties/{propertyId}/photos/main/reorder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Property> reorderMainPhotos(
            @PathVariable String propertyId,
            @RequestBody Map<String, List<String>> body) {
        return ResponseEntity.ok(propertyService.reorderMainPhotos(propertyId, body.get("urls")));
    }
}
