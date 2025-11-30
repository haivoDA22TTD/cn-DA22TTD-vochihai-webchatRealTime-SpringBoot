package org.chatapp.backend.messagecontent;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.chatapp.backend.messageroommember.MessageRoomMemberDTO;
import org.chatapp.backend.messageroommember.MessageRoomMemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/messagecontents")
public class MessageContentController {

    private final MessageContentService messageContentService;
    private final MessageRoomMemberService messageRoomMemberService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final RedisRateLimiterService redisRateLimiterService;

    @Operation(summary = "Hiển thị tin nhắn trong phòng chat")
    @GetMapping("/{roomId}")
    public ResponseEntity<List<MessageContentDTO>> getMessagesByRoomId(@PathVariable UUID roomId) {
        return ResponseEntity.ok(messageContentService.getMessagesByRoomId(roomId));
    }

    @MessageMapping("/send-message")
    public void sendMessage(@Payload MessageContentDTO messageContentDTO) {
        // Lấy thông tin người gửi từ chính MessageContentDTO thay vì Principal
        String sender = messageContentDTO.getSender();

        // Kiểm tra xem có thông tin người gửi hay không
        if (sender == null || sender.trim().isEmpty()) {
            return; // Không xử lý tin nhắn nếu không có thông tin người gửi
        }

        UUID roomId = messageContentDTO.getMessageRoomId();

        // Kiểm tra Room ID
        if (roomId == null) {
            simpMessagingTemplate.convertAndSendToUser(
                    sender,
                    "/queue/errors",
                    "Room ID không được để trống"
            );
            return;
        }

        // Kiểm tra xem user có bị giới hạn gửi tin nhắn không
        if (!redisRateLimiterService.isAllowedToSend(sender, roomId)) {
            simpMessagingTemplate.convertAndSendToUser(
                    sender,
                    "/queue/errors",
                    "Bạn gửi tin nhắn quá nhanh. Vui lòng đợi 1 phút trước khi gửi tin nhắn tiếp theo."
            );
            return; // Không xử lý tin nhắn
        }

        try {
            // Lưu và gửi tin nhắn bình thường
            MessageContentDTO savedMessage = messageContentService.save(messageContentDTO);

            List<MessageRoomMemberDTO> members = messageRoomMemberService.findByMessageRoomId(roomId);
            for (MessageRoomMemberDTO member : members) {
                simpMessagingTemplate.convertAndSendToUser(
                        member.getUsername(),
                        "/queue/messages",
                        savedMessage
                );
            }
        } catch (Exception e) {
            simpMessagingTemplate.convertAndSendToUser(
                    sender,
                    "/queue/errors",
                    "Có lỗi xảy ra khi gửi tin nhắn."
            );
        }
    }
}