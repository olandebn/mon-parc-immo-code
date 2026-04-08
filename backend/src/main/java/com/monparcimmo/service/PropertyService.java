package com.monparcimmo.service;

import com.google.cloud.firestore.*;
import com.monparcimmo.model.Property;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class PropertyService {

    private static final String COLLECTION = "properties";

    @Autowired
    private Firestore firestore;

    // Lister tous les biens (public)
    public List<Property> getAllProperties() {
        try {
            return firestore.collection(COLLECTION)
                    .orderBy("name")
                    .get().get().getDocuments()
                    .stream()
                    .map(doc -> doc.toObject(Property.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la récupération des biens", e);
        }
    }

    // Récupérer un bien par son ID
    public Property getPropertyById(String propertyId) {
        try {
            DocumentSnapshot doc = firestore.collection(COLLECTION).document(propertyId).get().get();
            if (doc.exists()) {
                return doc.toObject(Property.class);
            }
            throw new RuntimeException("Bien introuvable : " + propertyId);
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la récupération du bien", e);
        }
    }

    // ADMIN - Créer un nouveau bien
    public Property createProperty(Property property) {
        try {
            DocumentReference ref = firestore.collection(COLLECTION).document();
            property.setId(ref.getId());
            ref.set(property).get();
            return property;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la création du bien", e);
        }
    }

    // ADMIN - Mettre à jour un bien
    public Property updateProperty(String propertyId, Property property) {
        try {
            property.setId(propertyId);
            firestore.collection(COLLECTION).document(propertyId).set(property).get();
            return property;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la mise à jour du bien", e);
        }
    }

    // ADMIN - Supprimer un bien
    public void deleteProperty(String propertyId) {
        try {
            firestore.collection(COLLECTION).document(propertyId).delete().get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la suppression", e);
        }
    }

    public Property addMainPhoto(String propertyId, String url) {
        Property property = getPropertyById(propertyId);
        List<String> photos = property.getMainPhotoUrls();
        if (photos == null) photos = new ArrayList<>();
        photos.add(url);
        property.setMainPhotoUrls(photos);
        return updateProperty(propertyId, property);
    }

    public Property addSurroundingPhoto(String propertyId, String url) {
        Property property = getPropertyById(propertyId);
        List<String> photos = property.getSurroundingPhotoUrls();
        if (photos == null) photos = new ArrayList<>();
        photos.add(url);
        property.setSurroundingPhotoUrls(photos);
        return updateProperty(propertyId, property);
    }
}
