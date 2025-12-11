package org.chatapp.backend.messagecontent;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Service giới hạn tốc độ gửi tin nhắn (Rate Limiting)
 * 
 * Mục đích: Chống spam tin nhắn
 * 
 * Thuật toán: Sliding Window Counter (đơn giản hóa)
 * - Mỗi user + room có 1 counter trong Redis
 * - Counter tự động reset sau 60 giây (TTL)
 * - Nếu counter > 20 → chặn gửi tin nhắn
 * 
 * Ví dụ:
 * - User A gửi tin nhắn 1 → counter = 1
 * - User A gửi tin nhắn 2 → counter = 2
 * - ...
 * - User A gửi tin nhắn 21 → counter = 21 > 20 → CHẶN
 * - Sau 60 giây → counter reset về 0
 * 
 * Tại sao dùng Redis?
 * - Atomic increment (thread-safe)
 * - TTL tự động xóa key
 * - Nhanh (in-memory)
 * - Chia sẻ giữa nhiều server instances
 */
@Service
@RequiredArgsConstructor
public class RedisRateLimiterService {

    private final RedisTemplate<String, String> redisTemplate;

    /**
     * Kiểm tra user có được phép gửi tin nhắn không
     * 
     * @param userId - ID của user gửi tin nhắn
     * @param roomId - ID của phòng chat
     * @return true nếu được phép gửi, false nếu bị rate limit
     */
    public boolean isAllowedToSend(String userId, UUID roomId) {
        // Key format: "rate_limit:{userId}:{roomId}"
        // Mỗi user có counter riêng cho mỗi room
        String key = "rate_limit:" + userId + ":" + roomId;

        // INCR: Tăng counter lên 1 và trả về giá trị mới
        // Nếu key chưa tồn tại → tạo mới với giá trị 1
        // Operation này là atomic (thread-safe)
        Long count = redisTemplate.opsForValue().increment(key);

        // Nếu là tin nhắn đầu tiên trong window → set TTL 60 giây
        // Sau 60 giây, key tự động bị xóa → counter reset về 0
        if (count == 1) {
            redisTemplate.expire(key, 60, TimeUnit.SECONDS);
        }

        // Cho phép tối đa 20 tin nhắn trong 60 giây
        // Nếu count > 20 → return false → chặn gửi
        return count <= 20;
    }
}