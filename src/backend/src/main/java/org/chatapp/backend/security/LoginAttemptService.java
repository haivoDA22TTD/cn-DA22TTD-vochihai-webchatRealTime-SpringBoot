package org.chatapp.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Service theo dõi số lần đăng nhập sai và khóa tài khoản
 * 
 * Mục đích: Chống tấn công brute force (thử nhiều mật khẩu)
 * 
 * Cơ chế hoạt động:
 * - Mỗi lần đăng nhập sai → tăng counter trong Redis
 * - Sau 3 lần sai → khóa tài khoản 1 giờ
 * - Đăng nhập thành công → xóa counter
 * - Sau 1 giờ → Redis tự động xóa key (TTL hết hạn)
 * 
 * Tại sao dùng Redis thay vì database?
 * - Nhanh hơn (in-memory)
 * - Có TTL tự động xóa
 * - Không cần migration database
 * - Dễ scale (Redis cluster)
 */
@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    // Số lần đăng nhập sai tối đa trước khi khóa
    private static final int MAX_ATTEMPTS = 3;
    
    // Thời gian khóa tài khoản (phút)
    private static final long LOCK_TIME_DURATION = 60; // 60 phút = 1 giờ

    // Redis template để thao tác với Redis
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Tạo key Redis để lưu số lần đăng nhập sai
     * Ví dụ: "login_attempts:user1"
     */
    private String getAttemptsKey(String username) {
        return "login_attempts:" + username;
    }

    /**
     * Tạo key Redis để đánh dấu tài khoản bị khóa
     * Ví dụ: "login_locked:user1"
     */
    private String getLockKey(String username) {
        return "login_locked:" + username;
    }

    /**
     * Gọi khi đăng nhập thành công
     * Xóa tất cả counter và lock status
     */
    public void loginSucceeded(String username) {
        redisTemplate.delete(getAttemptsKey(username));
        redisTemplate.delete(getLockKey(username));
    }

    /**
     * Gọi khi đăng nhập thất bại
     * Tăng counter và khóa nếu vượt quá giới hạn
     */
    public void loginFailed(String username) {
        String attemptsKey = getAttemptsKey(username);
        
        // Lấy số lần đã sai từ Redis
        Integer attempts = (Integer) redisTemplate.opsForValue().get(attemptsKey);
        
        if (attempts == null) {
            attempts = 0;
        }
        
        // Tăng counter
        attempts++;
        
        // Lưu lại với TTL = LOCK_TIME_DURATION
        // Sau LOCK_TIME_DURATION phút, key tự động bị xóa
        redisTemplate.opsForValue().set(attemptsKey, attempts, LOCK_TIME_DURATION, TimeUnit.MINUTES);

        // Nếu đã sai >= 3 lần → khóa tài khoản
        if (attempts >= MAX_ATTEMPTS) {
            redisTemplate.opsForValue().set(getLockKey(username), true, LOCK_TIME_DURATION, TimeUnit.MINUTES);
        }
    }

    /**
     * Kiểm tra tài khoản có bị khóa không
     * @return true nếu bị khóa, false nếu không
     */
    public boolean isBlocked(String username) {
        Boolean locked = (Boolean) redisTemplate.opsForValue().get(getLockKey(username));
        return locked != null && locked;
    }

    /**
     * Lấy số lần thử còn lại
     * @return Số lần còn được thử (0-3)
     */
    public int getRemainingAttempts(String username) {
        Integer attempts = (Integer) redisTemplate.opsForValue().get(getAttemptsKey(username));
        if (attempts == null) {
            return MAX_ATTEMPTS;  // Chưa sai lần nào → còn 3 lần
        }
        return Math.max(0, MAX_ATTEMPTS - attempts);
    }

    /**
     * Lấy thời gian còn lại của khóa (phút)
     * @return Số phút còn lại, 0 nếu không bị khóa
     */
    public long getRemainingLockTime(String username) {
        // getExpire trả về TTL còn lại của key
        Long ttl = redisTemplate.getExpire(getLockKey(username), TimeUnit.MINUTES);
        return ttl != null ? ttl : 0;
    }
}
