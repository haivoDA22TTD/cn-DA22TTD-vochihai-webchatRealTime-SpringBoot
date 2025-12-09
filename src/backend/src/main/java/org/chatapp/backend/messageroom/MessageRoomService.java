package org.chatapp.backend.messageroom;

import lombok.RequiredArgsConstructor;
import org.chatapp.backend.messagecontent.MessageContentService;
import org.chatapp.backend.messageroommember.MessageRoomMember;
import org.chatapp.backend.messageroommember.MessageRoomMemberDTO;
import org.chatapp.backend.messageroommember.MessageRoomMemberService;
import org.chatapp.backend.user.User;
import org.chatapp.backend.user.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageRoomService {

    private final MessageRoomRepository messageRoomRepository;
    private final MessageRoomMapper messageRoomMapper;
    private final UserRepository userRepository;
    private final MessageContentService messageContentService;
    private final MessageRoomMemberService messageRoomMemberService;


    @Cacheable(value = "roomByMembers", key = "#members.hashCode() + '_' + #members.size()", unless = "#result == null")
    public MessageRoomDTO findMessageRoomByMembers(final List<String> members) {
        return messageRoomRepository.findMessageRoomByMembers(members, members.size())
                .map(m -> {
                    final MessageRoomDTO roomDTO = messageRoomMapper.toDTO(m, new MessageRoomDTO());
                    final List<MessageRoomMemberDTO> roomMembers = messageRoomMemberService.findByMessageRoomId(roomDTO.getId());
                    roomDTO.setMembers(roomMembers != null ? roomMembers : new ArrayList<>());
                    return roomDTO;
                })
                .orElse(null);
    }


    @CachePut(
            value = "roomByMembers",
            key = "@roomKeyHelper.key(#result)",
            unless = "#result == null"
    )
    @Transactional
    public MessageRoomDTO create(final List<String> members, String username) {
        // Lấy user tạo room
        final User user = userRepository.findById(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Tạo MessageRoom mới
        MessageRoom messageRoom = MessageRoom.builder()
                .isGroup(members.size() > 2)
                .createdBy(user)
                .members(new ArrayList<>())
                .build();

        // Lấy danh sách user tham gia
        final List<User> users = userRepository.findAllByUsernameIn(members);

        users.forEach(u -> {
            final MessageRoomMember member = MessageRoomMember.builder()
                    .messageRoom(messageRoom)
                    .user(u)
                    .isAdmin(u.getUsername().equals(username))
                    .lastSeen(LocalDateTime.now())
                    .build();
            messageRoom.getMembers().add(member);
        });

        // Lưu vào DB
        final MessageRoom saved = messageRoomRepository.save(messageRoom);

        // Chuyển sang DTO
        final MessageRoomDTO roomDTO = messageRoomMapper.toDTO(saved, new MessageRoomDTO());

        // Lấy danh sách members DTO
        final List<MessageRoomMemberDTO> roomMembers = messageRoomMemberService.findByMessageRoomId(roomDTO.getId());
        roomDTO.setMembers(roomMembers != null ? roomMembers : new ArrayList<>());

        return roomDTO;
    }


    @Cacheable(value = "userRoomList", key = "#username", unless = "#result == null || #result.isEmpty()")
    public List<MessageRoomDTO> findMessageRoomAtLeastOneContent(final String username) {
        return messageRoomRepository.findMessageRoomAtLeastOneContent(username)
                .stream()
                .map(m -> {
                    final MessageRoomDTO roomDTO = messageRoomMapper.toDTO(m, new MessageRoomDTO());
                    roomDTO.setUnseenCount(messageContentService.countUnseenMessage(roomDTO.getId(), username));
                    roomDTO.setLastMessage(messageContentService.getLastMessage(roomDTO.getId()));
                    final List<MessageRoomMemberDTO> members = messageRoomMemberService.findByMessageRoomId(roomDTO.getId());
                    roomDTO.setMembers(members != null ? members : new ArrayList<>());
                    return roomDTO;
                })
                .toList();
    }


    @Cacheable(value = "rooms", key = "#roomId", unless = "#result == null")
    public MessageRoomDTO findById(final UUID roomId) {
        return messageRoomRepository.findById(roomId)
                .map(room -> {
                    final MessageRoomDTO roomDTO = messageRoomMapper.toDTO(room, new MessageRoomDTO());
                    final List<MessageRoomMemberDTO> roomMembers = messageRoomMemberService.findByMessageRoomId(roomDTO.getId());
                    roomDTO.setMembers(roomMembers != null ? roomMembers : new ArrayList<>());
                    return roomDTO;
                })
                .orElse(null);
    }


    @CachePut(value = "rooms", key = "#roomId")
    @CacheEvict(value = "userRoomList", allEntries = true)
    @Transactional
    public MessageRoomDTO renameRoom(final UUID roomId, final String newName) {
        return messageRoomRepository.findById(roomId)
                .map(room -> {
                    room.setName(newName);
                    final MessageRoom saved = messageRoomRepository.save(room);
                    final MessageRoomDTO roomDTO = messageRoomMapper.toDTO(saved, new MessageRoomDTO());
                    final List<MessageRoomMemberDTO> roomMembers = messageRoomMemberService.findByMessageRoomId(roomDTO.getId());
                    roomDTO.setMembers(roomMembers != null ? roomMembers : new ArrayList<>());
                    return roomDTO;
                })
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

}
