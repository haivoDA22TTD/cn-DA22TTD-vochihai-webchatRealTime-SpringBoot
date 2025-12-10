package org.chatapp.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 3;
    private static final long LOCK_TIME_DURATION = 60; // 60 phút = 1 giờ

    private final RedisTemplate<String, Object> redisTemplate;

    private String getAttemptsKey(String username) {
        return "login_attempts:" + username;
    }

    private String getLockKey(String username) {
        return "login_locked:" + username;
    }

    public void loginSucceeded(String username) {
        redisTemplate.delete(getAttemptsKey(username));
        redisTemplate.delete(getLockKey(username));
    }

    public void loginFailed(String username) {
        String attemptsKey = getAttemptsKey(username);
        Integer attempts = (Integer) redisTemplate.opsForValue().get(attemptsKey);
        
        if (attempts == null) {
            attempts = 0;
        }
        
        attempts++;
        redisTemplate.opsForValue().set(attemptsKey, attempts, LOCK_TIME_DURATION, TimeUnit.MINUTES);

        if (attempts >= MAX_ATTEMPTS) {
            redisTemplate.opsForValue().set(getLockKey(username), true, LOCK_TIME_DURATION, TimeUnit.MINUTES);
        }
    }

    public boolean isBlocked(String username) {
        Boolean locked = (Boolean) redisTemplate.opsForValue().get(getLockKey(username));
        return locked != null && locked;
    }

    public int getRemainingAttempts(String username) {
        Integer attempts = (Integer) redisTemplate.opsForValue().get(getAttemptsKey(username));
        if (attempts == null) {
            return MAX_ATTEMPTS;
        }
        return Math.max(0, MAX_ATTEMPTS - attempts);
    }

    public long getRemainingLockTime(String username) {
        Long ttl = redisTemplate.getExpire(getLockKey(username), TimeUnit.MINUTES);
        return ttl != null ? ttl : 0;
    }
}
