package com.monparcimmo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Message {
    private String id;
    private String reservationId;   // La conversation est liée à une réservation
    private String senderUid;       // UID de l'expéditeur
    private String senderName;
    private String senderRole;      // ADMIN ou CLIENT
    private String content;
    private LocalDateTime sentAt;
    private boolean readByAdmin;
    private boolean readByClient;
}
