package haivo.chatapp.server.dto;

import haivo.chatapp.server.enums.UserStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private String username;
    private String password;
    private UserStatus status;
    private LocalDateTime lastLogin = LocalDateTime.now();
    private String avatarUrl;
}
