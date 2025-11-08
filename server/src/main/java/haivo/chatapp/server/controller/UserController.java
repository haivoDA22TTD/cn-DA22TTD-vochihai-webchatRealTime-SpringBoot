package haivo.chatapp.server.controller;

import haivo.chatapp.server.dto.UserDTO;
import haivo.chatapp.server.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping(value = "${api.prefix}/users")
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserDTO> login(@RequestBody final UserDTO userDTO) {
        return ResponseEntity.ok(userService.login(userDTO));
    }
}
