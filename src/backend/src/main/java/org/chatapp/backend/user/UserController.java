package org.chatapp.backend.user;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping(value = "${api.prefix}/users")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Xác thực người dùng")
    @PostMapping
    public ResponseEntity<LoginResponse> login(@RequestBody final UserDTO userDTO) {
        return ResponseEntity.ok(userService.login(userDTO));
    }
    
    @Operation(summary = "Đăng ký người dùng mới")
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody final UserDTO userDTO) {
        return ResponseEntity.ok(userService.register(userDTO));
    }

    @Operation(summary = "Gửi tin nhắn đến người dùng đang kết nối")
    @MessageMapping("/user/connect")
    @SendTo("/topic/active")
    public UserDTO connect(@RequestBody UserDTO userDTO) {
        return userService.connect(userDTO);
    }


    @Operation(summary = "Gửi tin nhắn đến ngưởi dùng đã ngắt keets nối")
    @MessageMapping("/user/disconnect")
    @SendTo("/topic/active")
    public UserDTO disconnect(@RequestBody UserDTO userDTO) {
        return userService.logout(userDTO.getUsername());
    }

    @Operation(summary = "Hiển thị người dùng đang hoạt động")
    @GetMapping("/online")
    public ResponseEntity<List<UserDTO>> getOnlineUsers() {
        return ResponseEntity.ok(userService.getOnlineUsers());
    }


    @Operation(summary = "Tìm kiếm người dùng theo tên")
    @GetMapping("/search/{username}")
    public ResponseEntity<List<UserDTO>> searchUsersByUsername(@PathVariable final String username) {
        return ResponseEntity.ok(userService.searchUsersByUsername(username));
    }


    @Operation(summary = "Cập nhật ảnh đại diện")
    @PostMapping("/avatar")
    public ResponseEntity<UserDTO> uploadAvatar(@RequestParam final MultipartFile file,
                                                @RequestParam final String username) {
        return ResponseEntity.ok(userService.uploadAvatar(file, username));
    }

}
