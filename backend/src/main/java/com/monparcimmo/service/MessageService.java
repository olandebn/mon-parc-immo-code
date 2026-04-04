package com.monparcimmo.service;

import com.google.cloud.firestore.*;
import com.monparcimmo.model.Message;
import com.monparcimmo.model.Reservation;
import com.monparcimmo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private static final String COLLECTION = "messages";

    @Autowired
    private Firestore firestore;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ReservationService reservationService;

    public Message sendMessage(String reservationId, String content, String senderUid) {
        try {
            User sender = userService.getUserByUid(senderUid);
            boolean isAdmin = "ADMIN".equals(sender.getRole());

            Message message = new Message();
            message.setSenderUid(senderUid);
            message.setSenderName(sender.getFirstName() + " " + sender.getLastName());
            message.setSenderRole(sender.getRole());
            message.setReservationId(reservationId);
            message.setContent(content);
            message.setSentAt(LocalDateTime.now());
            message.setReadByAdmin(isAdmin);
            message.setReadByClient(!isAdmin);

            DocumentReference ref = firestore.collection(COLLECTION).document();
            message.setId(ref.getId());
            ref.set(message).get();

            // Notifier par email la partie adverse
            notifyByEmail(reservationId, sender, isAdmin);

            return message;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de l'envoi du message", e);
        }
    }

    public List<Message> getMessagesByReservation(String reservationId, String uid) {
        try {
            return firestore.collection(COLLECTION)
                    .whereEqualTo("reservationId", reservationId)
                    .orderBy("sentAt", Query.Direction.ASCENDING)
                    .get().get().getDocuments()
                    .stream()
                    .map(doc -> doc.toObject(Message.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors de la récupération des messages", e);
        }
    }

    public void markMessagesAsRead(String reservationId, String uid) {
        try {
            User user = userService.getUserByUid(uid);
            boolean isAdmin = "ADMIN".equals(user.getRole());

            List<QueryDocumentSnapshot> docs = firestore.collection(COLLECTION)
                    .whereEqualTo("reservationId", reservationId)
                    .get().get().getDocuments();

            WriteBatch batch = firestore.batch();
            for (QueryDocumentSnapshot doc : docs) {
                if (isAdmin) {
                    batch.update(doc.getReference(), "readByAdmin", true);
                } else {
                    batch.update(doc.getReference(), "readByClient", true);
                }
            }
            batch.commit().get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur lors du marquage", e);
        }
    }

    public List<Map<String, Object>> getAllThreadsForAdmin() {
        try {
            // Récupérer les réservations avec des messages non lus
            List<QueryDocumentSnapshot> allMessages = firestore.collection(COLLECTION)
                    .whereEqualTo("readByAdmin", false)
                    .get().get().getDocuments();

            // Grouper par reservationId
            Map<String, Long> unreadByReservation = allMessages.stream()
                    .collect(Collectors.groupingBy(
                            doc -> doc.getString("reservationId"),
                            Collectors.counting()
                    ));

            List<Map<String, Object>> threads = new ArrayList<>();
            for (Map.Entry<String, Long> entry : unreadByReservation.entrySet()) {
                Map<String, Object> thread = new HashMap<>();
                thread.put("reservationId", entry.getKey());
                thread.put("unreadCount", entry.getValue());
                threads.add(thread);
            }

            return threads;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Erreur", e);
        }
    }

    private void notifyByEmail(String reservationId, User sender, boolean senderIsAdmin) {
        try {
            Reservation reservation = reservationService.getAllReservations()
                    .stream()
                    .filter(r -> r.getId().equals(reservationId))
                    .findFirst()
                    .orElse(null);

            if (reservation == null) return;

            if (senderIsAdmin) {
                // Notifier le client
                emailService.sendNewMessageNotification(
                        reservation.getClientEmail(),
                        reservation.getClientName(),
                        sender.getFirstName() + " " + sender.getLastName(),
                        reservationId
                );
            }
            // Si le client envoie, l'admin est notifié par l'email de réservation existant
        } catch (Exception e) {
            // Ne pas bloquer l'envoi du message si l'email échoue
        }
    }
}
