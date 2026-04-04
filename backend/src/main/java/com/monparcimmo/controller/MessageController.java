package com.monparcimmo.controller;

import com.monparcimmo.model.Message;
import com.monparcimmo.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // AUTHENTIFIÉ - Envoyer un message dans un fil de réservation
    @PostMapping("/reservation/{reservationId}")
    public ResponseEntity<Message> sendMessage(
            @PathVariable String reservationId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        String senderUid = (String) auth.getPrincipal();
        Message message = messageService.sendMessage(reservationId, body.get("content"), senderUid);
        return ResponseEntity.ok(message);
    }

    // AUTHENTIFIÉ - Récupérer les messages d'une réservation
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable String reservationId,
            Authentication auth) {
        String uid = (String) auth.getPrincipal();
        List<Message> messages = messageService.getMessagesByReservation(reservationId, uid);
        return ResponseEntity.ok(messages);
    }

    // AUTHENTIFIÉ - Marquer les messages comme lus
    @PatchMapping("/reservation/{reservationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable String reservationId,
            Authentication auth) {
        String uid = (String) auth.getPrincipal();
        messageService.markMessagesAsRead(reservationId, uid);
        return ResponseEntity.noContent().build();
    }

    // ADMIN - Récupérer tous les fils de messages avec messages non lus
    @GetMapping("/admin/threads")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllThreads() {
        return ResponseEntity.ok(messageService.getAllThreadsForAdmin());
    }
}
