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
    @ResponseBody
    public ResponseEntity<List<MessageContentDTO>> getMessagesByRoomId(@PathVariable UUID roomId) {
        return ResponseEntity.ok(messageContentService.getMessagesByRoomId(roomId));
    }

    @Operation(summary = "Upload ảnh cho tin nhắn")
    @PostMapping("/upload-image")
    @ResponseBody
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

    /**
     * Danh sách các định dạng file được phép upload
     * Chỉ cho phép: .docx, .pptx, .xlsx, .pdf, .zip, .rar
     */
    private static final java.util.Set<String> ALLOWED_FILE_EXTENSIONS = java.util.Set.of(
        ".docx", ".pptx", ".xlsx", ".xls", ".pdf", ".zip", ".rar"
    );

    @Operation(summary = "Upload file đính kèm cho tin nhắn")
    @PostMapping("/upload-file")
    @ResponseBody
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("=== UPLOAD FILE DEBUG ===");
            String originalFilename = file.getOriginalFilename();
            System.out.println("File name: " + originalFilename);
            System.out.println("File size: " + file.getSize());
            
            // Kiểm tra định dạng file
            if (originalFilename == null || originalFilename.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", "Tên file không hợp lệ")
                );
            }
            
            String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            System.out.println("File extension: " + extension);
            
            if (!ALLOWED_FILE_EXTENSIONS.contains(extension)) {
                System.err.println("ERROR: File extension not allowed: " + extension);
                return ResponseEntity.badRequest().body(
                    java.util.Map.of(
                        "error", "Định dạng file không được phép",
                        "message", "Chỉ cho phép các định dạng: .docx, .pptx, .xlsx, .xls, .pdf, .zip, .rar",
                        "extension", extension
                    )
                );
            }
            
            // Kiểm tra kích thước file (tối đa 50MB)
            long maxSize = 50 * 1024 * 1024; // 50MB
            if (file.getSize() > maxSize) {
                return ResponseEntity.badRequest().body(
                    java.util.Map.of(
                        "error", "File quá lớn",
                        "message", "Kích thước file tối đa là 50MB"
                    )
                );
            }
            
            // Lưu file
            String storedFileName = FileUtils.storeFile(file, "messages");
            String fileUrl = FileUtils.getMessageImageUrl(storedFileName);
            
            System.out.println("Stored file name: " + storedFileName);
            System.out.println("File URL: " + fileUrl);
            System.out.println("=========================");
            
            // Trả về thông tin file dạng JSON
            return ResponseEntity.ok(java.util.Map.of(
                "url", fileUrl,
                "name", originalFilename,
                "size", file.getSize(),
                "extension", extension
            ));
        } catch (Exception e) {
            System.err.println("Upload failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                java.util.Map.of("error", "Lỗi upload file: " + e.getMessage())
            );
        }
    }

    /**
     * Lấy thông tin preview của một URL (Open Graph metadata)
     * Dùng để hiển thị preview khi gửi link (như Zalo)
     */
    @Operation(summary = "Lấy thông tin preview của URL")
    @GetMapping("/link-preview")
    @ResponseBody
    public ResponseEntity<?> getLinkPreview(@RequestParam("url") String url) {
        try {
            System.out.println("=== LINK PREVIEW DEBUG ===");
            System.out.println("URL: " + url);
            
            // Validate URL
            if (url == null || url.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    java.util.Map.of("error", "URL không được để trống")
                );
            }
            
            // Thêm protocol nếu thiếu
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }
            
            // Fetch và parse HTML
            org.jsoup.nodes.Document doc = org.jsoup.Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .timeout(5000)
                .get();
            
            // Lấy Open Graph metadata
            String title = getMetaContent(doc, "og:title");
            if (title == null || title.isEmpty()) {
                title = doc.title();
            }
            
            String description = getMetaContent(doc, "og:description");
            if (description == null || description.isEmpty()) {
                description = getMetaContent(doc, "description");
            }
            
            String image = getMetaContent(doc, "og:image");
            
            System.out.println("Title: " + title);
            System.out.println("Description: " + description);
            System.out.println("Image: " + image);
            System.out.println("=========================");
            
            return ResponseEntity.ok(java.util.Map.of(
                "url", url,
                "title", title != null ? title : "",
                "description", description != null ? description : "",
                "image", image != null ? image : ""
            ));
        } catch (Exception e) {
            System.err.println("Link preview failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(
                java.util.Map.of("error", "Không thể lấy thông tin từ URL: " + e.getMessage())
            );
        }
    }
    
    /**
     * Helper method để lấy content từ meta tag
     */
    private String getMetaContent(org.jsoup.nodes.Document doc, String property) {
        // Thử lấy từ og: property
        org.jsoup.nodes.Element element = doc.selectFirst("meta[property=" + property + "]");
        if (element != null) {
            return element.attr("content");
        }
        // Thử lấy từ name attribute
        element = doc.selectFirst("meta[name=" + property + "]");
        if (element != null) {
            return element.attr("content");
        }
        return null;
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