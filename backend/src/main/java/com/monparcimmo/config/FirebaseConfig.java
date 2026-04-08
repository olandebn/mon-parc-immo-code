package com.monparcimmo.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Configuration
public class FirebaseConfig {

    // Chemin vers le fichier JSON (développement local)
    @Value("${firebase.service-account-path:classpath:firebase-service-account.json}")
    private Resource serviceAccountResource;

    // JSON encodé en base64 (variable d'env Railway en production)
    @Value("${firebase.service-account-json:}")
    private String serviceAccountJson;

    @PostConstruct
    public void initializeFirebase() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            GoogleCredentials credentials;

            if (StringUtils.hasText(serviceAccountJson)) {
                // Production : JSON injecté via variable d'environnement (base64 ou JSON brut)
                byte[] jsonBytes;
                try {
                    // Essaie de décoder en base64 d'abord
                    jsonBytes = Base64.getDecoder().decode(serviceAccountJson.trim());
                } catch (IllegalArgumentException e) {
                    // Si pas du base64, c'est du JSON brut
                    jsonBytes = serviceAccountJson.getBytes(StandardCharsets.UTF_8);
                }
                credentials = GoogleCredentials.fromStream(new ByteArrayInputStream(jsonBytes));
            } else {
                // Développement : fichier JSON dans les ressources
                credentials = GoogleCredentials.fromStream(serviceAccountResource.getInputStream());
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();

            FirebaseApp.initializeApp(options);
        }
    }

    @Bean
    public Firestore firestore() {
        return FirestoreClient.getFirestore();
    }
}
