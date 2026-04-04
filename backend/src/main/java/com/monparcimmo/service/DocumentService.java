package com.monparcimmo.service;

import com.google.cloud.firestore.*;
import com.monparcimmo.model.PropertyDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private static final String COLLECTION = "documents";

    @Autowired
    private Firestore firestore;

    public List<PropertyDocument> getDocumentsForClients() {
        try {
            return firestore.collection(COLLECTION)
                    .whereEqualTo("visibleToClients", true)
                    .get().get().getDocuments()
                    .stream()
                    .map(doc -> doc.toObject(PropertyDocument.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    public List<PropertyDocument> getAllDocuments() {
        try {
            return firestore.collection(COLLECTION)
                    .orderBy("uploadedAt", Query.Direction.DESCENDING)
                    .get().get().getDocuments()
                    .stream()
                    .map(doc -> doc.toObject(PropertyDocument.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    public PropertyDocument addDocument(PropertyDocument document, String adminUid) {
        try {
            document.setUploadedAt(LocalDateTime.now());
            document.setUploadedByUid(adminUid);

            DocumentReference ref = firestore.collection(COLLECTION).document();
            document.setId(ref.getId());
            ref.set(document).get();
            return document;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de l'ajout du document", e);
        }
    }

    public PropertyDocument updateDocument(String id, PropertyDocument document) {
        try {
            document.setId(id);
            firestore.collection(COLLECTION).document(id).set(document).get();
            return document;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la mise à jour", e);
        }
    }

    public void deleteDocument(String id) {
        try {
            firestore.collection(COLLECTION).document(id).delete().get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la suppression", e);
        }
    }
}
