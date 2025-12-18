package org.chatapp.backend.messageroom;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.chatapp.backend.messageroommember.MessageRoomMemberDTO;
import org.chatapp.backend.messageroommember.MessageRoomMemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(value = "${api.prefix}/messagerooms")
public class MessageRoomController {

    private final MessageRoomService messageRoomService;
    private final MessageRoomMemberService messageRoomMemberService;
    private final SimpMessagingTemplate simpMessagingTemplate;


    @Operation(summary = "Tìm phòng chat")
    @GetMapping("/find-chat-room")
    public ResponseEntity<MessageRoomDTO> findMessageRoomByMembers(@RequestParam final List<String> members) {
        return ResponseEntity.ok(messageRoomService.findMessageRoomByMembers(members));
    }


    @Operation(summary = "Tạo phòng chat")
    @PostMapping("/create-chat-room")
    public ResponseEntity<MessageRoomDTO> create(@RequestParam final List<String> members,
                                                 @RequestParam final String username) {
        return ResponseEntity.ok(messageRoomService.create(members, username));
    }


    @Operation(summary = "Tìm phòng chat thông qua tên người dùng")
    @GetMapping("/find-chat-room-at-least-one-content/{username}")
    public ResponseEntity<List<MessageRoomDTO>> findMessageRoomAtLeastOneContent(@PathVariable final String username) {
        return ResponseEntity.ok(messageRoomService.findMessageRoomAtLeastOneContent(username));
    }


    @Operation(summary = "Hiển thị phòng chat")
    @GetMapping("/{roomId}")
    public ResponseEntity<MessageRoomDTO> findById(@PathVariable final UUID roomId) {
        return ResponseEntity.ok(messageRoomService.findById(roomId));
    }


    @Operation(summary = "Đổi tên nhóm chat")
    @PutMapping("/{roomId}/rename")
    public ResponseEntity<MessageRoomDTO> renameRoom(@PathVariable final UUID roomId,
                                                     @RequestParam final String newName) {
        return ResponseEntity.ok(messageRoomService.renameRoom(roomId, newName));
    }


    @Operation(summary = "Đặt ảnh nền cho cuộc trò chuyện")
    @PutMapping("/{roomId}/background")
    public ResponseEntity<MessageRoomDTO> setBackground(@PathVariable final UUID roomId,
                                                        @RequestParam final String backgroundUrl) {
        MessageRoomDTO updatedRoom = messageRoomService.setBackground(roomId, backgroundUrl);
        
        // Gửi thông báo realtime cho tất cả thành viên trong phòng
        List<MessageRoomMemberDTO> members = messageRoomMemberService.findByMessageRoomId(roomId);
        for (MessageRoomMemberDTO member : members) {
            simpMessagingTemplate.convertAndSendToUser(
                member.getUsername(),
                "/queue/room-updates",
                updatedRoom
            );
        }
        
        return ResponseEntity.ok(updatedRoom);
    }

}
