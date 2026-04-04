package com.monparcimmo.service;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.monparcimmo.model.Property;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class PropertyService {

    private static final String COLLECTION = "property";
    private static final String PROPERTY_DOC_ID = "main";

    @Autowired
    private Firestore firestore;

    public Property getProperty() {
        try {
            DocumentSnapshot doc = firestore.collection(COLLECTION)
                    .document(PROPERTY_DOC_ID).get().get();
            if (doc.exists()) {
                return doc.toObject(Property.class);
            }
            return new Property(); // Retourner un objet vide si pas encore configuré
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la récupération du bien", e);
        }
    }

    public Property updateProperty(Property property) {
        try {
            DocumentReference ref = firestore.collection(COLLECTION).document(PROPERTY_DOC_ID);
            ref.set(property).get();
            return property;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la mise à jour du bien", e);
        }
    }

    public Property addMainPhoto(String url) {
        Property property = getProperty();
        List<String> photos = property.getMainPhotoUrls();
        if (photos == null) photos = new ArrayList<>();
        photos.add(url);
        property.setMainPhotoUrls(photos);
        return updateProperty(property);
    }

    public Property addSurroundingPhoto(String url) {
        Property property = getProperty();
        List<String> photos = property.getSurroundingPhotoUrls();
        if (photos == null) photos = new ArrayList<>();
        photos.add(url);
        property.setSurroundingPhotoUrls(photos);
        return updateProperty(property);
    }
}
