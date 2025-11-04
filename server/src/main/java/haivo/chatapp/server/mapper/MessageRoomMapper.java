package haivo.chatapp.server.mapper;

import haivo.chatapp.server.dto.MessageRoomDTO;
import haivo.chatapp.server.model.MessageRoom;
import haivo.chatapp.server.model.User;
import haivo.chatapp.server.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MessageRoomMapper {

    private final UserRepository userRepository;

    public MessageRoomDTO toDTO(final MessageRoom messageRoom,
                                   final MessageRoomDTO messageRoomDTO){
        messageRoomDTO.setId(messageRoom.getId());
        messageRoomDTO.setName(messageRoom.getName());
        messageRoomDTO.setCreatedDate(messageRoom.getCreatedDate());
        messageRoomDTO.setCreatedById(messageRoom.getCreatedBy().getUsername());

        return messageRoomDTO;
    }

    public MessageRoom toEntity(final MessageRoomDTO messageRoomDTO,
                                final MessageRoom messageRoom){
        messageRoom.setId(messageRoomDTO.getId());
        messageRoom.setName(messageRoomDTO.getName());
        messageRoom.setGroup(messageRoomDTO.getIsGroup());
        messageRoom.setCreatedDate(messageRoomDTO.getCreatedDate());
        final User createdBy = messageRoomDTO.getCreatedById() == null ? null : userRepository.findById(messageRoomDTO.getCreatedById())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        messageRoom.setCreatedBy(createdBy);
        return messageRoom;
    }
}
