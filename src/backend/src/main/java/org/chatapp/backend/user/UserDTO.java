package org.chatapp.backend.user;

import lombok.Data;

import java.io.Serializable;

@Data
public class UserDTO implements Serializable {
    private static final long serialVersionUID = 1L; // Số phiên bản để đảm bảo tính tương thích
    private String username;
    private String password;
    private UserStatus status;
    private String avatarUrl;
}
