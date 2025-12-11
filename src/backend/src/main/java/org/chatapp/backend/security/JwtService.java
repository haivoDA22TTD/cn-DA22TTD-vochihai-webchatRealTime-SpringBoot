package org.chatapp.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service xử lý JWT (JSON Web Token)
 * 
 * JWT là chuẩn mở (RFC 7519) để truyền thông tin an toàn giữa các bên dưới dạng JSON.
 * 
 * Cấu trúc JWT gồm 3 phần, ngăn cách bởi dấu chấm:
 * 1. Header: Chứa loại token (JWT) và thuật toán ký (HS256)
 * 2. Payload: Chứa claims (thông tin) như username, thời gian hết hạn
 * 3. Signature: Chữ ký số để xác minh token không bị sửa đổi
 * 
 * Ví dụ: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMSJ9.abc123...
 *        [     Header     ].[    Payload    ].[Signature]
 */
@Service
public class JwtService {

    // Khóa bí mật để ký token (phải >= 256 bits cho HS256)
    // Đọc từ application.properties, nếu không có thì dùng giá trị mặc định
    @Value("${jwt.secret:chatapp-secret-key-must-be-at-least-256-bits-long-for-hs256}")
    private String secretKey;

    // Thời gian hết hạn của token (mặc định 24 giờ = 86400000 ms)
    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    /**
     * Trích xuất username từ token
     * Username được lưu trong claim "sub" (subject)
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Trích xuất một claim bất kỳ từ token
     * @param claimsResolver - Function để lấy claim cần thiết
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Tạo JWT token từ username
     * @param username - Tên đăng nhập của user
     * @return JWT token string
     */
    public String generateToken(String username) {
        return generateToken(new HashMap<>(), username);
    }

    /**
     * Tạo JWT token với extra claims
     * @param extraClaims - Các thông tin bổ sung (role, permissions, etc.)
     * @param username - Tên đăng nhập
     */
    public String generateToken(Map<String, Object> extraClaims, String username) {
        return Jwts.builder()
                .claims(extraClaims)                                              // Thêm extra claims
                .subject(username)                                                // Set subject = username
                .issuedAt(new Date(System.currentTimeMillis()))                   // Thời điểm tạo token
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration)) // Thời điểm hết hạn
                .signWith(getSignInKey())                                         // Ký bằng secret key
                .compact();                                                       // Build thành string
    }

    /**
     * Kiểm tra token có hợp lệ không
     * Token hợp lệ khi: username khớp VÀ chưa hết hạn
     */
    public boolean isTokenValid(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username)) && !isTokenExpired(token);
    }

    /**
     * Kiểm tra token đã hết hạn chưa
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Lấy thời điểm hết hạn từ token
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Parse token và lấy tất cả claims
     * Quá trình này cũng verify signature của token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())  // Verify bằng secret key
                .build()
                .parseSignedClaims(token)    // Parse và verify signature
                .getPayload();               // Lấy payload (claims)
    }

    /**
     * Tạo SecretKey từ string secret
     * Sử dụng HMAC-SHA256 algorithm
     */
    private SecretKey getSignInKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
