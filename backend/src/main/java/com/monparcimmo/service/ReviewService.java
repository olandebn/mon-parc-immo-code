package com.monparcimmo.service;

import com.google.cloud.firestore.*;
import com.monparcimmo.model.Review;
import com.monparcimmo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private static final String COLLECTION = "reviews";

    @Autowired
    private Firestore firestore;

    @Autowired
    private UserService userService;

    public List<Review> getVisibleReviews() {
        try {
            return firestore.collection(COLLECTION)
                    .whereEqualTo("visible", true)
                    .orderBy("createdAt", Query.Direction.DESCENDING)
                    .get().get().getDocuments()
                    .stream()
                    .map(doc -> doc.toObject(Review.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    public Map<String, Object> getReviewSummary() {
        List<Review> reviews = getVisibleReviews();
        if (reviews.isEmpty()) {
            return Map.of("totalReviews", 0, "averageRating", 0.0);
        }

        double avgOverall = reviews.stream().mapToInt(Review::getOverallRating).average().orElse(0);
        double avgCleanliness = reviews.stream().mapToInt(Review::getCleanlinessRating).average().orElse(0);
        double avgComfort = reviews.stream().mapToInt(Review::getComfortRating).average().orElse(0);
        double avgLocation = reviews.stream().mapToInt(Review::getLocationRating).average().orElse(0);
        double avgCommunication = reviews.stream().mapToInt(Review::getCommunicationRating).average().orElse(0);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalReviews", reviews.size());
        summary.put("averageRating", Math.round(avgOverall * 10.0) / 10.0);
        summary.put("averageCleanliness", Math.round(avgCleanliness * 10.0) / 10.0);
        summary.put("averageComfort", Math.round(avgComfort * 10.0) / 10.0);
        summary.put("averageLocation", Math.round(avgLocation * 10.0) / 10.0);
        summary.put("averageCommunication", Math.round(avgCommunication * 10.0) / 10.0);

        return summary;
    }

    public Review submitReview(Review review, String clientUid) {
        try {
            User client = userService.getUserByUid(clientUid);
            review.setClientUid(clientUid);
            review.setClientName(client.getFirstName() + " " + client.getLastName());
            review.setCreatedAt(LocalDateTime.now());
            review.setVisible(true);

            DocumentReference ref = firestore.collection(COLLECTION).document();
            review.setId(ref.getId());
            ref.set(review).get();
            return review;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la soumission de l'avis", e);
        }
    }

    public List<Review> getAllReviews() {
        try {
            return firestore.collection(COLLECTION)
                    .orderBy("createdAt", Query.Direction.DESCENDING)
                    .get().get().getDocuments()
                    .stream()
                    .map(doc -> doc.toObject(Review.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    public Review addAdminResponse(String id, String response) {
        try {
            firestore.collection(COLLECTION).document(id)
                    .update("adminResponse", response).get();
            return firestore.collection(COLLECTION).document(id).get().get().toObject(Review.class);
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    public Review setVisibility(String id, boolean visible) {
        try {
            firestore.collection(COLLECTION).document(id)
                    .update("visible", visible).get();
            return firestore.collection(COLLECTION).document(id).get().get().toObject(Review.class);
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }
}
