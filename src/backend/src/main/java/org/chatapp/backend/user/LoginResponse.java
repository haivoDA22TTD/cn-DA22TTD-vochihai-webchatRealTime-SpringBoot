package org.chatapp.backend.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private String username;
    private String avatarUrl;
    private UserStatus status;
    private String token;
    private boolean success;
    private String message;
    private int remainingAttempts;
    private long lockTimeMinutes;
}
