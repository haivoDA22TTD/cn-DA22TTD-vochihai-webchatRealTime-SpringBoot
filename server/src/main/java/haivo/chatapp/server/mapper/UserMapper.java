package haivo.chatapp.server.mapper;

import haivo.chatapp.server.dto.MessageRoomDTO;
import haivo.chatapp.server.dto.UserDTO;
import haivo.chatapp.server.model.MessageRoom;
import haivo.chatapp.server.model.User;
import haivo.chatapp.server.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserMapper {

    public UserDTO toDTO(final User user,
                         final UserDTO userDTO) {

        userDTO.setUsername(user.getUsername());
        userDTO.setPassword(user.getPassword());
        userDTO.setStatus(user.getStatus());
        userDTO.setAvatarUrl(user.getAvatarUrl());
        return userDTO;
    }

    public User toEntity(final UserDTO userDTO,
                         final User user){
        user.setUsername(userDTO.getUsername());
        user.setPassword(userDTO.getPassword());
        user.setStatus(userDTO.getStatus());
        user.setAvatarUrl(userDTO.getAvatarUrl());
        return user;
    }
}
