package haivo.chatapp.server.mapper;

import haivo.chatapp.server.dto.MessageRoomDTO;
import haivo.chatapp.server.dto.MessageRoomMemberDTO;
import haivo.chatapp.server.model.MessageRoom;
import haivo.chatapp.server.model.MessageRoomMember;
import haivo.chatapp.server.model.User;
import haivo.chatapp.server.repository.MessageRoomRepository;
import haivo.chatapp.server.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MessageRoomMemberMapper {

    private final MessageRoomRepository messageRoomRepository;
    private final UserRepository userRepository;

    public MessageRoomMemberDTO toDTO(final MessageRoomMember messageRoomMember,
                                      final MessageRoomMemberDTO messageRoomMemberDto){
        messageRoomMemberDto.setMessageRoomId(messageRoomMember.getMessageRoom().getId());
        messageRoomMemberDto.setUsername(messageRoomMember.getUser().getUsername());
        messageRoomMemberDto.setIsAdmin(messageRoomMember.getIsAdmin());
        messageRoomMemberDto.setLastSeen(messageRoomMember.getLastSeen());
        messageRoomMemberDto.setLastLogin(messageRoomMember.getUser().getLastLogin());

        return messageRoomMemberDto;
    }

    public MessageRoomMember toEntity(final MessageRoomMemberDTO messageRoomMemberDTO,
                                      final MessageRoomMember messageRoomMember){
        final MessageRoom messageRoom = messageRoomMemberDTO.getMessageRoomId() == null ? null: messageRoomRepository.findById(messageRoomMemberDTO.getMessageRoomId())
                .orElseThrow(() -> new EntityNotFoundException("MessageRoom not found") ).getMessageRoom();
                messageRoomMember.setMessageRoom(messageRoom);
                final User createdBy = messageRoomMemberDTO.getUsername() == null ? null : userRepository.findById(messageRoomMemberDTO.getUsername())
                        .orElseThrow(() -> new EntityNotFoundException("User not found"));
                messageRoomMember.setUser(createdBy);
                messageRoomMember.setIsAdmin(messageRoomMemberDTO.getIsAdmin());
                messageRoomMember.setLastSeen(messageRoomMemberDTO.getLastSeen());

        return messageRoomMember;
    }
}
