package com.monparcimmo.service;

import com.google.cloud.firestore.*;
import com.monparcimmo.model.PricingSeason;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class PricingService {

    private static final String COLLECTION = "pricing_seasons";

    @Autowired
    private Firestore firestore;

    public List<PricingSeason> getActiveSeasons() {
        try {
            return firestore.collection(COLLECTION)
                    .whereEqualTo("active", true)
                    .get().get().getDocuments()
                    .stream()
                    .map(doc -> doc.toObject(PricingSeason.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la récupération des tarifs", e);
        }
    }

    public List<PricingSeason> getAllSeasons() {
        try {
            return firestore.collection(COLLECTION)
                    .orderBy("startDate", Query.Direction.DESCENDING)
                    .get().get().getDocuments()
                    .stream()
                    .map(doc -> doc.toObject(PricingSeason.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    public Map<String, Object> calculatePrice(LocalDate checkIn, LocalDate checkOut) {
        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        if (nights <= 0) throw new RuntimeException("Les dates sont invalides");

        // Trouver la saison applicable (en prenant la saison dont la période contient checkIn)
        PricingSeason applicableSeason = findApplicableSeason(checkIn);

        Map<String, Object> result = new HashMap<>();
        result.put("nights", nights);
        result.put("checkIn", checkIn.toString());
        result.put("checkOut", checkOut.toString());

        if (applicableSeason != null) {
            result.put("seasonName", applicableSeason.getName());
            result.put("seasonType", applicableSeason.getType());

            // Déterminer le meilleur tarif
            double price;
            String pricingType;

            if (nights >= 7 && applicableSeason.getWeeklyRate() > 0) {
                // Calculer en semaines
                long fullWeeks = nights / 7;
                long remainingNights = nights % 7;
                price = (fullWeeks * applicableSeason.getWeeklyRate())
                      + (remainingNights * applicableSeason.getNightlyRate());
                pricingType = "WEEKLY";
            } else if (nights >= 2 && nights <= 3 && applicableSeason.getWeekendRate() > 0) {
                price = applicableSeason.getWeekendRate();
                pricingType = "WEEKEND";
            } else {
                price = nights * applicableSeason.getNightlyRate();
                pricingType = "NIGHTLY";
            }

            result.put("totalPrice", price);
            result.put("pricingType", pricingType);
            result.put("nightlyRate", applicableSeason.getNightlyRate());
            result.put("weekendRate", applicableSeason.getWeekendRate());
            result.put("weeklyRate", applicableSeason.getWeeklyRate());
            result.put("currency", "EUR");
        } else {
            result.put("message", "Aucun tarif configuré pour ces dates. Contactez l'administrateur.");
        }

        return result;
    }

    private PricingSeason findApplicableSeason(LocalDate date) {
        List<PricingSeason> seasons = getActiveSeasons();
        return seasons.stream()
                .filter(s -> s.getStartDate() != null && s.getEndDate() != null
                        && !date.isBefore(s.getStartDate())
                        && !date.isAfter(s.getEndDate()))
                .findFirst()
                .orElse(null);
    }

    public PricingSeason createSeason(PricingSeason season) {
        try {
            DocumentReference ref = firestore.collection(COLLECTION).document();
            season.setId(ref.getId());
            ref.set(season).get();
            return season;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la création", e);
        }
    }

    public PricingSeason updateSeason(String id, PricingSeason season) {
        try {
            season.setId(id);
            firestore.collection(COLLECTION).document(id).set(season).get();
            return season;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la mise à jour", e);
        }
    }

    public void deleteSeason(String id) {
        try {
            firestore.collection(COLLECTION).document(id).delete().get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la suppression", e);
        }
    }
}
