package com.monparcimmo.service;

import com.google.cloud.firestore.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;
import com.monparcimmo.model.Invitation;
import com.monparcimmo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final String USERS_COLLECTION = "users";
    private static final String INVITATIONS_COLLECTION = "invitations";

    @Autowired
    private Firestore firestore;

    @Autowired
    private EmailService emailService;

    @Value("${app.invitation.expiry-hours}")
    private int invitationExpiryHours;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // Inscription publique : crée le profil Firestore (le compte Firebase est déjà créé côté client)
    public User createUser(User user) {
        try {
            // Ne pas écraser le rôle si déjà défini (ADMIN = gérant, CLIENT = voyageur)
            if (user.getRole() == null) {
                user.setRole("CLIENT");
            }
            user.setActive(true);
            user.setCreatedAt(LocalDateTime.now());
            firestore.collection(USERS_COLLECTION).document(user.getUid()).set(user).get();
            return user;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la création du profil", e);
        }
    }

    public User getUserByUid(String uid) {
        try {
            DocumentSnapshot doc = firestore.collection(USERS_COLLECTION).document(uid).get().get();
            if (doc.exists()) {
                return doc.toObject(User.class);
            }
            throw new RuntimeException("Utilisateur introuvable : " + uid);
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la récupération de l'utilisateur", e);
        }
    }

    public User updateUser(String uid, User user) {
        try {
            user.setUid(uid);
            firestore.collection(USERS_COLLECTION).document(uid).set(user, SetOptions.merge()).get();
            return user;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la mise à jour", e);
        }
    }

    public List<User> getAllUsers() {
        try {
            return firestore.collection(USERS_COLLECTION)
                    .whereEqualTo("role", "CLIENT")
                    .get().get().getDocuments()
                    .stream()
                    .map(doc -> doc.toObject(User.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la récupération des utilisateurs", e);
        }
    }

    public Invitation createInvitation(Invitation invitation, String adminUid) {
        try {
            String token = UUID.randomUUID().toString();
            invitation.setToken(token);
            invitation.setStatus("PENDING");
            invitation.setCreatedAt(LocalDateTime.now());
            invitation.setExpiresAt(LocalDateTime.now().plusHours(invitationExpiryHours));
            invitation.setCreatedByUid(adminUid);

            DocumentReference ref = firestore.collection(INVITATIONS_COLLECTION).document();
            invitation.setId(ref.getId());
            ref.set(invitation).get();

            // Envoyer l'email d'invitation
            String invitationLink = frontendUrl + "/invitation/" + token;
            emailService.sendInvitationEmail(invitation, invitationLink);

            return invitation;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la création de l'invitation", e);
        }
    }

    public Invitation validateInvitationToken(String token) {
        try {
            QuerySnapshot snapshot = firestore.collection(INVITATIONS_COLLECTION)
                    .whereEqualTo("token", token)
                    .get().get();

            if (snapshot.isEmpty()) {
                throw new RuntimeException("Invitation invalide");
            }

            Invitation invitation = snapshot.getDocuments().get(0).toObject(Invitation.class);

            if (!"PENDING".equals(invitation.getStatus())) {
                throw new RuntimeException("Cette invitation a déjà été utilisée ou a expiré");
            }

            if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
                // Marquer comme expirée
                firestore.collection(INVITATIONS_COLLECTION)
                        .document(invitation.getId())
                        .update("status", "EXPIRED").get();
                throw new RuntimeException("Ce lien d'invitation a expiré");
            }

            return invitation;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la validation", e);
        }
    }

    public Map<String, String> acceptInvitation(String token, String password) {
        try {
            Invitation invitation = validateInvitationToken(token);

            // Créer le compte Firebase Auth
            UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                    .setEmail(invitation.getEmail())
                    .setPassword(password)
                    .setDisplayName(invitation.getFirstName() + " " + invitation.getLastName());

            UserRecord userRecord = FirebaseAuth.getInstance().createUser(createRequest);

            // Créer le profil dans Firestore
            User user = new User();
            user.setUid(userRecord.getUid());
            user.setEmail(invitation.getEmail());
            user.setFirstName(invitation.getFirstName());
            user.setLastName(invitation.getLastName());
            user.setRole("CLIENT");
            user.setActive(true);
            user.setCreatedAt(LocalDateTime.now());

            firestore.collection(USERS_COLLECTION).document(userRecord.getUid()).set(user).get();

            // Marquer l'invitation comme acceptée
            firestore.collection(INVITATIONS_COLLECTION)
                    .document(invitation.getId())
                    .update("status", "ACCEPTED", "acceptedAt", LocalDateTime.now()).get();

            Map<String, String> result = new HashMap<>();
            result.put("uid", userRecord.getUid());
            result.put("message", "Compte créé avec succès");
            return result;

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'acceptation de l'invitation : " + e.getMessage(), e);
        }
    }

    public List<Invitation> getAllInvitations() {
        try {
            return firestore.collection(INVITATIONS_COLLECTION)
                    .orderBy("createdAt", Query.Direction.DESCENDING)
                    .get().get().getDocuments()
                    .stream()
                    .map(doc -> doc.toObject(Invitation.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    public void deactivateUser(String uid) {
        try {
            firestore.collection(USERS_COLLECTION).document(uid).update("active", false).get();
            FirebaseAuth.getInstance().updateUser(new UserRecord.UpdateRequest(uid).setDisabled(true));
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la désactivation", e);
        }
    }
}
