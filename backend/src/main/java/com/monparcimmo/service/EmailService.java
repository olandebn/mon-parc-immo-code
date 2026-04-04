package com.monparcimmo.service;

import com.monparcimmo.model.Invitation;
import com.monparcimmo.model.Reservation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // Notifier l'admin d'une nouvelle réservation
    public void sendNewReservationNotification(Reservation reservation) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(adminEmail);
        message.setSubject("[MonParcImmo] Nouvelle demande de réservation");
        message.setText(
            "Bonjour,\n\n" +
            "Une nouvelle demande de réservation a été reçue :\n\n" +
            "Client : " + reservation.getClientName() + "\n" +
            "Email : " + reservation.getClientEmail() + "\n" +
            "Arrivée : " + reservation.getCheckInDate() + "\n" +
            "Départ : " + reservation.getCheckOutDate() + "\n" +
            "Voyageurs : " + reservation.getNumberOfGuests() + "\n" +
            "Prix total : " + reservation.getTotalPrice() + " " + reservation.getCurrency() + "\n\n" +
            "Voir la réservation : " + frontendUrl + "/admin/reservations/" + reservation.getId() + "\n\n" +
            "MonParcImmo"
        );
        mailSender.send(message);
    }

    // Confirmer la réservation au client
    public void sendReservationConfirmationToClient(Reservation reservation) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(reservation.getClientEmail());
        message.setSubject("[MonParcImmo] Votre demande de réservation a bien été reçue");
        message.setText(
            "Bonjour " + reservation.getClientName() + ",\n\n" +
            "Votre demande de réservation a bien été reçue et est en attente de confirmation.\n\n" +
            "Récapitulatif :\n" +
            "Arrivée : " + reservation.getCheckInDate() + "\n" +
            "Départ : " + reservation.getCheckOutDate() + "\n" +
            "Nombre de voyageurs : " + reservation.getNumberOfGuests() + "\n" +
            "Prix total : " + reservation.getTotalPrice() + " " + reservation.getCurrency() + "\n\n" +
            "Vous serez notifié par email lors de la confirmation.\n\n" +
            "Gérer votre réservation : " + frontendUrl + "/reservations/" + reservation.getId() + "\n\n" +
            "À bientôt,\nL'équipe MonParcImmo"
        );
        mailSender.send(message);
    }

    // Notifier le client d'un changement de statut
    public void sendReservationStatusUpdate(Reservation reservation, String newStatus) {
        String statusText = "CONFIRMED".equals(newStatus) ? "confirmée" : "annulée";
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(reservation.getClientEmail());
        message.setSubject("[MonParcImmo] Votre réservation a été " + statusText);
        message.setText(
            "Bonjour " + reservation.getClientName() + ",\n\n" +
            "Votre réservation du " + reservation.getCheckInDate() + " au " +
            reservation.getCheckOutDate() + " a été " + statusText + ".\n\n" +
            "Voir votre réservation : " + frontendUrl + "/reservations/" + reservation.getId() + "\n\n" +
            "Cordialement,\nL'équipe MonParcImmo"
        );
        mailSender.send(message);
    }

    // Envoyer le lien d'invitation
    public void sendInvitationEmail(Invitation invitation, String invitationLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(invitation.getEmail());
        message.setSubject("[MonParcImmo] Vous avez été invité à rejoindre MonParcImmo");
        message.setText(
            "Bonjour " + invitation.getFirstName() + ",\n\n" +
            "Vous avez été invité à créer un compte sur MonParcImmo afin d'accéder " +
            "aux réservations et aux informations du logement.\n\n" +
            "Cliquez sur le lien ci-dessous pour créer votre compte :\n" +
            invitationLink + "\n\n" +
            "Ce lien est valable 72 heures.\n\n" +
            "Cordialement,\nL'équipe MonParcImmo"
        );
        mailSender.send(message);
    }

    // Notifier d'un nouveau message
    public void sendNewMessageNotification(String toEmail, String toName,
                                           String senderName, String reservationId) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("[MonParcImmo] Nouveau message de " + senderName);
        message.setText(
            "Bonjour " + toName + ",\n\n" +
            "Vous avez reçu un nouveau message de " + senderName + " concernant votre réservation.\n\n" +
            "Voir le message : " + frontendUrl + "/reservations/" + reservationId + "\n\n" +
            "MonParcImmo"
        );
        mailSender.send(message);
    }
}
