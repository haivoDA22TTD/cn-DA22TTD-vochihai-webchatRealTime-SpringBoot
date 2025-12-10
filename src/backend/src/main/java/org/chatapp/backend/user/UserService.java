package org.chatapp.backend.user;

import lombok.RequiredArgsConstructor;
import org.chatapp.backend.security.JwtService;
import org.chatapp.backend.security.LoginAttemptService;
import org.chatapp.backend.utils.FileUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttemptService;

    public LoginResponse login(final UserDTO userDTO) {
        String username = userDTO.getUsername();
        
        // Kiểm tra tài khoản có bị khóa không
        if (loginAttemptService.isBlocked(username)) {
            long remainingTime = loginAttemptService.getRemainingLockTime(username);
            return LoginResponse.builder()
                    .success(false)
                    .message("Tài khoản đã bị khóa do nhập sai mật khẩu quá nhiều lần. Vui lòng thử lại sau " + remainingTime + " phút.")
                    .lockTimeMinutes(remainingTime)
                    .build();
        }

        // Tìm user
        Optional<User> userOpt = userRepository.findById(username);
        
        if (userOpt.isEmpty()) {
            // User không tồn tại - tạo mới
            return register(userDTO);
        }

        User user = userOpt.get();
        
        // Kiểm tra mật khẩu
        boolean passwordMatch;
        if (user.getPasswordEncoded() != null && user.getPasswordEncoded()) {
            passwordMatch = passwordEncoder.matches(userDTO.getPassword(), user.getPassword());
        } else {
            // Mật khẩu cũ chưa mã hóa - so sánh trực tiếp và mã hóa lại
            passwordMatch = userDTO.getPassword().equals(user.getPassword());
            if (passwordMatch) {
                // Mã hóa mật khẩu cũ
                user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
                user.setPasswordEncoded(true);
                userRepository.save(user);
            }
        }

        if (!passwordMatch) {
            loginAttemptService.loginFailed(username);
            int remaining = loginAttemptService.getRemainingAttempts(username);
            
            if (remaining == 0) {
                long lockTime = loginAttemptService.getRemainingLockTime(username);
                return LoginResponse.builder()
                        .success(false)
                        .message("Tài khoản đã bị khóa do nhập sai mật khẩu 3 lần. Vui lòng thử lại sau " + lockTime + " phút.")
                        .remainingAttempts(0)
                        .lockTimeMinutes(lockTime)
                        .build();
            }
            
            return LoginResponse.builder()
                    .success(false)
                    .message("Mật khẩu không chính xác. Còn " + remaining + " lần thử.")
                    .remainingAttempts(remaining)
                    .build();
        }

        // Đăng nhập thành công
        loginAttemptService.loginSucceeded(username);
        String token = jwtService.generateToken(username);

        return LoginResponse.builder()
                .success(true)
                .message("Đăng nhập thành công")
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .status(user.getStatus())
                .token(token)
                .build();
    }

    public LoginResponse register(final UserDTO userDTO) {
        // Kiểm tra user đã tồn tại chưa
        if (userRepository.existsById(userDTO.getUsername())) {
            return LoginResponse.builder()
                    .success(false)
                    .message("Tên đăng nhập đã tồn tại")
                    .build();
        }

        // Tạo user mới với mật khẩu đã mã hóa
        User user = User.builder()
                .username(userDTO.getUsername())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .passwordEncoded(true)
                .status(UserStatus.ONLINE)
                .lastLogin(LocalDateTime.now())
                .build();
        
        userRepository.save(user);
        
        String token = jwtService.generateToken(user.getUsername());

        return LoginResponse.builder()
                .success(true)
                .message("Đăng ký thành công")
                .username(user.getUsername())
                .avatarUrl(user.getAvatarUrl())
                .status(user.getStatus())
                .token(token)
                .build();
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





