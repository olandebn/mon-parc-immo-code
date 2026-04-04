package com.monparcimmo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    private String uid;            // Firebase UID
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;           // ADMIN ou CLIENT
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private boolean active;
}
