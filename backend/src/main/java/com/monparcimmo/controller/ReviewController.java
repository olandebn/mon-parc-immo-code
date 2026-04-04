package com.monparcimmo.controller;

import com.monparcimmo.model.Review;
import com.monparcimmo.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // PUBLIC - Récupérer tous les avis visibles
    @GetMapping("/public")
    public ResponseEntity<List<Review>> getPublicReviews() {
        return ResponseEntity.ok(reviewService.getVisibleReviews());
    }

    // PUBLIC - Récupérer la note moyenne
    @GetMapping("/public/summary")
    public ResponseEntity<Map<String, Object>> getReviewSummary() {
        return ResponseEntity.ok(reviewService.getReviewSummary());
    }

    // AUTHENTIFIÉ - Soumettre un avis (après une réservation terminée)
    @PostMapping
    public ResponseEntity<Review> submitReview(
            @RequestBody Review review,
            Authentication auth) {
        String clientUid = (String) auth.getPrincipal();
        Review created = reviewService.submitReview(review, clientUid);
        return ResponseEntity.ok(created);
    }

    // ADMIN - Voir tous les avis (incluant les masqués)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    // ADMIN - Répondre à un avis
    @PatchMapping("/admin/{id}/respond")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Review> respondToReview(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(reviewService.addAdminResponse(id, body.get("response")));
    }

    // ADMIN - Masquer/afficher un avis
    @PatchMapping("/admin/{id}/visibility")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Review> toggleVisibility(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(reviewService.setVisibility(id, body.get("visible")));
    }
}
