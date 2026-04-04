package com.monparcimmo.controller;

import com.monparcimmo.model.PropertyDocument;
import com.monparcimmo.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    // AUTHENTIFIÉ - Voir les documents accessibles aux clients
    @GetMapping
    public ResponseEntity<List<PropertyDocument>> getClientDocuments() {
        return ResponseEntity.ok(documentService.getDocumentsForClients());
    }

    // ADMIN - Lister tous les documents
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PropertyDocument>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    // ADMIN - Ajouter un document (avec URL Firebase Storage déjà uploadé)
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PropertyDocument> addDocument(
            @RequestBody PropertyDocument document,
            Authentication auth) {
        String adminUid = (String) auth.getPrincipal();
        PropertyDocument created = documentService.addDocument(document, adminUid);
        return ResponseEntity.ok(created);
    }

    // ADMIN - Modifier un document
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PropertyDocument> updateDocument(
            @PathVariable String id,
            @RequestBody PropertyDocument document) {
        return ResponseEntity.ok(documentService.updateDocument(id, document));
    }

    // ADMIN - Supprimer un document
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDocument(@PathVariable String id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
