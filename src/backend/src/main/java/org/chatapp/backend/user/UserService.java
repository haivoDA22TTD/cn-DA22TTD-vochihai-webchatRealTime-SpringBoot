package org.chatapp.backend.user;

import lombok.RequiredArgsConstructor;
import org.chatapp.backend.utils.FileUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.swing.text.html.Option;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Cacheable(value = "users", key = "#userDTO.username")
    public UserDTO login(final UserDTO userDTO) {
        final User user = userRepository.findById(userDTO.getUsername())
                .orElseGet(() -> createUser(userDTO));

        validatePassword(userDTO, user.getPassword());

        return userMapper.toDTO(user, new UserDTO());
    }


    private void validatePassword(UserDTO userDTO, String password) {
        if(!userDTO.getPassword().equals(password)) {
            throw new IllegalArgumentException("Invalid password");
        }
    }

    @CachePut(value = "users", key = "#result.username")
    private User createUser(UserDTO userDTO) {
        final User user = User.builder()
                .username(userDTO.getUsername())
                .password(userDTO.getPassword())
                .status(UserStatus.ONLINE)
                .lastLogin(LocalDateTime.now())
                .build();
        return userRepository.save(user);
    }

    @CachePut(value = "users", key = "#userDTO.username")
    public UserDTO connect(UserDTO userDTO) {
        Optional<User> user = userRepository.findById(userDTO.getUsername());
        user.ifPresent(u -> {
            u.setStatus(UserStatus.ONLINE);
            userRepository.save(u);
        });
        return user.map(u -> userMapper.toDTO(u, new UserDTO())).orElse(null);
    }


    @Cacheable(value = "onlineUsers", cacheNames = "onlineUsers", sync = true)
    public List<UserDTO> getOnlineUsers() {
        return userRepository.findAllByStatus(UserStatus.ONLINE)
                .stream()
                .map(u -> userMapper.toDTO(u, new UserDTO()))
                .toList();
    }


    @CacheEvict(value = "users", key = "#username")

    public UserDTO logout(final String username) {
        Optional<User> user = userRepository.findById(username);
        user.ifPresent(u -> {
            u.setStatus(UserStatus.OFFLINE);
            u.setLastLogin(LocalDateTime.now());
            userRepository.save(u);
        });
        return user.map(u -> userMapper.toDTO(u, new UserDTO())).orElse(null);
    }


    @Cacheable(value = "userSearch", key = "#username")
    public List<UserDTO> searchUsersByUsername(final String username) {
        return userRepository.findAllByUsernameContainingIgnoreCase(username)
                .stream()
                .map(u -> userMapper.toDTO(u, new UserDTO()))
                .toList();
    }


    @CacheEvict(value = "users", key = "#username")
    public UserDTO uploadAvatar(final MultipartFile file, final String username) {
        final Optional<User> user = userRepository.findById(username);

        if(user.isPresent())  {
            if(user.get().getAvatarUrl() != null) {
                // delete
                FileUtils.deleteFile("/" + FileUtils.FOLDER_AVATAR + "/" + user.get().getAvatarShortUrl());
            }
            // upload
            String avatarUrl = FileUtils.storeFile(file, FileUtils.FOLDER_AVATAR);
            user.get().setAvatarUrl(avatarUrl);
            userRepository.save(user.get());
        }
        return user.map(u -> userMapper.toDTO(u, new UserDTO())).orElse(null);
    }

}





