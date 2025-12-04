package org.chatapp.backend.messagecontent;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.chatapp.backend.messageroommember.MessageRoomMemberDTO;
import org.chatapp.backend.messageroommember.MessageRoomMemberService;
import org.chatapp.backend.utils.FileUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @Operation(summary = "Upload ảnh cho tin nhắn")
    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("=== UPLOAD IMAGE DEBUG ===");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            
            String fileName = FileUtils.storeFile(file, "messages");
            System.out.println("Stored file name: " + fileName);
            
            String imageUrl = FileUtils.getMessageImageUrl(fileName);
            System.out.println("Image URL: " + imageUrl);
            System.out.println("BACKEND_URL: " + FileUtils.BACKEND_URL);
            System.out.println("=========================");
            
            return ResponseEntity.ok(imageUrl);
        } catch (Exception e) {
            System.err.println("Upload failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to upload image: " + e.getMessage());
        }
    }

    @MessageMapping("/send-message")
    public void sendMessage(@Payload MessageContentDTO messageContentDTO) {
        System.out.println("=== SEND MESSAGE DEBUG ===");
        System.out.println("Sender: " + messageContentDTO.getSender());
        System.out.println("Content: " + messageContentDTO.getContent());
        System.out.println("MessageType: " + messageContentDTO.getMessageType());
        System.out.println("RoomId: " + messageContentDTO.getMessageRoomId());
        
        // Lấy thông tin người gửi từ chính MessageContentDTO thay vì Principal
        String sender = messageContentDTO.getSender();

        // Kiểm tra xem có thông tin người gửi hay không
        if (sender == null || sender.trim().isEmpty()) {
            System.err.println("ERROR: Sender is null or empty");
            return; // Không xử lý tin nhắn nếu không có thông tin người gửi
        }

        UUID roomId = messageContentDTO.getMessageRoomId();

        // Kiểm tra Room ID
        if (roomId == null) {
            System.err.println("ERROR: Room ID is null");
            simpMessagingTemplate.convertAndSendToUser(
                    sender,
                    "/queue/errors",
                    "Room ID không được để trống"
            );
            return;
        }

        // Kiểm tra xem user có bị giới hạn gửi tin nhắn không
        boolean isAllowed = redisRateLimiterService.isAllowedToSend(sender, roomId);
        System.out.println("Rate limit check: " + isAllowed);
        
        if (!isAllowed) {
            System.err.println("ERROR: Rate limit exceeded for " + sender);
            simpMessagingTemplate.convertAndSendToUser(
                    sender,
                    "/queue/errors",
                    "Bạn gửi tin nhắn quá nhanh. Vui lòng đợi 1 phút trước khi gửi tin nhắn tiếp theo."
            );
            return; // Không xử lý tin nhắn
        }

        try {
            // Lưu và gửi tin nhắn bình thường
            System.out.println("Saving message...");
            MessageContentDTO savedMessage = messageContentService.save(messageContentDTO);
            System.out.println("Message saved with ID: " + savedMessage.getId());
            System.out.println("Saved MessageType: " + savedMessage.getMessageType());

            List<MessageRoomMemberDTO> members = messageRoomMemberService.findByMessageRoomId(roomId);
            System.out.println("Sending to " + members.size() + " members");
            
            for (MessageRoomMemberDTO member : members) {
                simpMessagingTemplate.convertAndSendToUser(
                        member.getUsername(),
                        "/queue/messages",
                        savedMessage
                );
                System.out.println("Sent to: " + member.getUsername());
            }
            System.out.println("=========================");
        } catch (Exception e) {
            System.err.println("ERROR: Exception while sending message");
            e.printStackTrace();
            simpMessagingTemplate.convertAndSendToUser(
                    sender,
                    "/queue/errors",
                    "Có lỗi xảy ra khi gửi tin nhắn: " + e.getMessage()
            );
        }
    }
}