package com.monparcimmo.controller;

import com.monparcimmo.model.Property;
import com.monparcimmo.service.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    @Autowired
    private PropertyService propertyService;

    // PUBLIC - Lister tous les biens
    @GetMapping
    public ResponseEntity<List<Property>> getAllProperties() {
        return ResponseEntity.ok(propertyService.getAllProperties());
    }

    // PUBLIC - Récupérer un bien
    @GetMapping("/{propertyId}")
    public ResponseEntity<Property> getProperty(@PathVariable String propertyId) {
        return ResponseEntity.ok(propertyService.getPropertyById(propertyId));
    }

    // ADMIN - Créer un bien
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Property> createProperty(@RequestBody Property property) {
        return ResponseEntity.ok(propertyService.createProperty(property));
    }

    // ADMIN - Modifier un bien
    @PutMapping("/{propertyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Property> updateProperty(
            @PathVariable String propertyId,
            @RequestBody Property property) {
        return ResponseEntity.ok(propertyService.updateProperty(propertyId, property));
    }

    // ADMIN - Supprimer un bien
    @DeleteMapping("/{propertyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProperty(@PathVariable String propertyId) {
        propertyService.deleteProperty(propertyId);
        return ResponseEntity.noContent().build();
    }

    // ADMIN - Ajouter une photo principale
    @PostMapping("/{propertyId}/photos/main")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Property> addMainPhoto(
            @PathVariable String propertyId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(propertyService.addMainPhoto(propertyId, body.get("url")));
    }

    // ADMIN - Ajouter une photo des alentours
    @PostMapping("/{propertyId}/photos/surrounding")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Property> addSurroundingPhoto(
            @PathVariable String propertyId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(propertyService.addSurroundingPhoto(propertyId, body.get("url")));
    }
}
