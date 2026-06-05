package com.monparcimmo.security;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class FirebaseAuthFilter extends OncePerRequestFilter {

    @Autowired
    private Firestore firestore;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                String uid = decodedToken.getUid();

                Map<String, Object> claims = decodedToken.getClaims();
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();

                boolean isAdmin = Boolean.TRUE.equals(claims.get("admin"));

                // ── Fallback Firestore ──────────────────────────────────────────
                // Si le custom claim n'est pas présent, on vérifie le rôle dans
                // Firestore (comptes créés avant la gestion des claims).
                // On en profite pour poser le claim manquant.
                if (!isAdmin) {
                    try {
                        DocumentSnapshot doc = firestore
                                .collection("users")
                                .document(uid)
                                .get()
                                .get(); // bloquant mais acceptable dans un filtre

                        String role = doc.getString("role");
                        if ("ADMIN".equals(role)) {
                            isAdmin = true;
                            // Poser le custom claim pour les prochaines requêtes
                            FirebaseAuth.getInstance()
                                    .setCustomUserClaims(uid, Map.of("admin", true));
                            logger.info("Claim admin posé en fallback pour uid=" + uid);
                        }
                    } catch (Exception firestoreEx) {
                        logger.warn("Fallback Firestore role check échoué : " + firestoreEx.getMessage());
                    }
                }

                if (isAdmin) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                }
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(uid, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                logger.warn("Token Firebase invalide : " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
