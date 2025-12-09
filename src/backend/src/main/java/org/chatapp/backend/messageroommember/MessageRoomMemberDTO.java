package org.chatapp.backend.messageroommember;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MessageRoomMemberDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private UUID messageRoomId;
    private String username;
    private Boolean isAdmin;
    private LocalDateTime lastSeen;
    private LocalDateTime lastLogin;
    private String avatarUrl;
}
