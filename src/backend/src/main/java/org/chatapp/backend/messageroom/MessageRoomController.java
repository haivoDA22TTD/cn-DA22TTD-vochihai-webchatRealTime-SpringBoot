package org.chatapp.backend.messageroom;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(value = "${api.prefix}/messagerooms")
public class MessageRoomController {

    private final MessageRoomService messageRoomService;


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

}
