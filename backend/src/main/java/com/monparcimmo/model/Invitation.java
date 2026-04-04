package com.monparcimmo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Invitation {
    private String id;
    private String token;           // Token unique dans l'URL
    private String email;           // Email de la personne invitée
    private String firstName;
    private String lastName;
    private String status;          // PENDING, ACCEPTED, EXPIRED
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime acceptedAt;
    private String createdByUid;    // UID de l'admin qui a créé l'invitation
}
