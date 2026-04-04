package com.monparcimmo.controller;

import com.monparcimmo.model.Property;
import com.monparcimmo.service.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/property")
public class PropertyController {

    @Autowired
    private PropertyService propertyService;

    // PUBLIC - Récupérer les infos de l'appartement
    @GetMapping
    public ResponseEntity<Property> getProperty() {
        Property property = propertyService.getProperty();
        return ResponseEntity.ok(property);
    }

    // ADMIN - Mettre à jour les infos de l'appartement
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Property> updateProperty(@RequestBody Property property) {
        Property updated = propertyService.updateProperty(property);
        return ResponseEntity.ok(updated);
    }

    // ADMIN - Ajouter une photo principale
    @PostMapping("/photos/main")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Property> addMainPhoto(@RequestBody PhotoUrlRequest request) {
        Property updated = propertyService.addMainPhoto(request.getUrl());
        return ResponseEntity.ok(updated);
    }

    // ADMIN - Ajouter une photo des alentours
    @PostMapping("/photos/surrounding")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Property> addSurroundingPhoto(@RequestBody PhotoUrlRequest request) {
        Property updated = propertyService.addSurroundingPhoto(request.getUrl());
        return ResponseEntity.ok(updated);
    }

    // Classe interne pour la requête
    public static class PhotoUrlRequest {
        private String url;
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }
}
