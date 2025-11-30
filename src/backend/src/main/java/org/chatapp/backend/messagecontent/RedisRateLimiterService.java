package org.chatapp.backend.messagecontent;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisRateLimiterService {

    private final RedisTemplate<String, String> redisTemplate;

    public boolean isAllowedToSend(String userId, UUID roomId) {
        String key = "rate_limit:" + userId + ":" + roomId;

        // Tăng số đếm tin nhắn
        Long count = redisTemplate.opsForValue().increment(key);

        // Nếu là lần đầu tiên trong khoảng thời gian, đặt thời gian hết hạn 60 giây
        if (count == 1) {
            redisTemplate.expire(key, 60, TimeUnit.SECONDS);
        }

        // Nếu số tin nhắn vượt quá 5 tin nhắn trong 60 giây thì không cho gửi
        return count <= 10;
    }
}