package com.monparcimmo.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PropertyDocument {
    private String id;
    private String title;           // ex: "Règlement intérieur", "Guide d'arrivée"
    private String type;            // HOUSE_RULES, ARRIVAL_INSTRUCTIONS, DEPARTURE_INSTRUCTIONS, OTHER
    private String fileUrl;         // URL Firebase Storage
    private String fileName;
    private String mimeType;        // application/pdf, image/jpeg, etc.
    private long fileSizeBytes;
    private boolean visibleToClients; // true = visible par les clients connectés
    private LocalDateTime uploadedAt;
    private String uploadedByUid;
    private List<String> photoUrls; // Photos associées au document (ex: photos "comment ranger")
}
