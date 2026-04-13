package com.monparcimmo.controller;

import com.monparcimmo.model.Invitation;
import com.monparcimmo.model.User;
import com.monparcimmo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    // PUBLIC - Valider un lien d'invitation
    @GetMapping("/auth/invitation/{token}")
    public ResponseEntity<Invitation> validateInvitation(@PathVariable String token) {
        Invitation invitation = userService.validateInvitationToken(token);
        return ResponseEntity.ok(invitation);
    }

    // PUBLIC - Accepter une invitation et créer le compte
    @PostMapping("/auth/invitation/{token}/accept")
    public ResponseEntity<Map<String, String>> acceptInvitation(
            @PathVariable String token,
            @RequestBody Map<String, String> body) {
        // body doit contenir : password
        String password = body.get("password");
        Map<String, String> result = userService.acceptInvitation(token, password);
        return ResponseEntity.ok(result);
    }

    // AUTHENTIFIÉ - Inscription publique (crée le profil Firestore après création Firebase côté client)
    @PostMapping("/auth/register")
    public ResponseEntity<User> register(
            @RequestBody Map<String, String> body,
            Authentication auth) {
        String uid = (String) auth.getPrincipal();

        // Vérifier si le profil existe déjà (double appel)
        try {
            User existing = userService.getUserByUid(uid);
            if (existing != null) return ResponseEntity.ok(existing);
        } catch (Exception ignored) {}

        // Rôle : ADMIN (gérant) ou CLIENT (voyageur), CLIENT par défaut
        String role = "ADMIN".equalsIgnoreCase(body.getOrDefault("role", "CLIENT")) ? "ADMIN" : "CLIENT";

        User user = new User();
        user.setUid(uid);
        user.setFirstName(body.getOrDefault("firstName", ""));
        user.setLastName(body.getOrDefault("lastName", ""));
        user.setEmail(body.getOrDefault("email", ""));
        user.setRole(role);
        user.setActive(true);

        return ResponseEntity.ok(userService.createUser(user));
    }

    // AUTHENTIFIÉ - Récupérer son profil
    @GetMapping("/users/me")
    public ResponseEntity<User> getMyProfile(Authentication auth) {
        String uid = (String) auth.getPrincipal();
        return ResponseEntity.ok(userService.getUserByUid(uid));
    }

    // AUTHENTIFIÉ - Mettre à jour son profil
    @PutMapping("/users/me")
    public ResponseEntity<User> updateMyProfile(
            @RequestBody User user,
            Authentication auth) {
        String uid = (String) auth.getPrincipal();
        return ResponseEntity.ok(userService.updateUser(uid, user));
    }

    // AUTHENTIFIÉ - Passer son compte en mode Gérant (ADMIN)
    @PostMapping("/users/me/become-admin")
    public ResponseEntity<User> becomeAdmin(Authentication auth) {
        String uid = (String) auth.getPrincipal();
        User user = userService.getUserByUid(uid);
        user.setRole("ADMIN");
        User updated = userService.updateUser(uid, user);
        return ResponseEntity.ok(updated);
    }

    // ADMIN - Lister tous les clients
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ADMIN - Créer un lien d'invitation
    @PostMapping("/admin/invitations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invitation> createInvitation(
            @RequestBody Invitation invitation,
            Authentication auth) {
        String adminUid = (String) auth.getPrincipal();
        Invitation created = userService.createInvitation(invitation, adminUid);
        return ResponseEntity.ok(created);
    }

    // ADMIN - Lister les invitations
    @GetMapping("/admin/invitations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Invitation>> getAllInvitations() {
        return ResponseEntity.ok(userService.getAllInvitations());
    }

    // ADMIN - Désactiver un utilisateur
    @PatchMapping("/admin/users/{uid}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable String uid) {
        userService.deactivateUser(uid);
        return ResponseEntity.noContent().build();
    }
}
