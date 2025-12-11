package org.chatapp.backend.config;

import lombok.RequiredArgsConstructor;
import org.chatapp.backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Cấu hình Spring Security với JWT Authentication
 * 
 * Spring Security: Framework bảo mật cho ứng dụng Spring
 * JWT (JSON Web Token): Cơ chế xác thực stateless, token chứa thông tin user
 * 
 * Luồng xác thực:
 * 1. User đăng nhập → Server tạo JWT token
 * 2. Client lưu token và gửi kèm trong header: Authorization: Bearer <token>
 * 3. JwtAuthenticationFilter kiểm tra token mỗi request
 * 4. Nếu hợp lệ → cho phép truy cập, nếu không → trả về 401
 */
@Configuration
@EnableWebSecurity  // Bật Spring Security
@RequiredArgsConstructor  // Lombok: tự động tạo constructor với final fields
public class SecurityConfig {

    // Filter kiểm tra JWT token (được inject qua constructor)
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Bean mã hóa mật khẩu bằng BCrypt
     * BCrypt: Thuật toán hash có salt, chống rainbow table attack
     * Độ mạnh mặc định: 10 (2^10 = 1024 rounds)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Cấu hình Security Filter Chain
     * Filter Chain: Chuỗi các filter xử lý request theo thứ tự
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Tắt CSRF (Cross-Site Request Forgery) vì dùng JWT
            // CSRF protection cần thiết cho session-based auth, không cần cho JWT
            .csrf(AbstractHttpConfigurer::disable)
            
            // Bật CORS (đã cấu hình trong CorsConfig)
            .cors(cors -> {})
            
            // Cấu hình session: STATELESS = không tạo session
            // JWT là stateless, server không lưu trạng thái đăng nhập
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Cấu hình authorization cho các endpoint
            .authorizeHttpRequests(auth -> auth
                // PUBLIC ENDPOINTS - Không cần đăng nhập
                .requestMatchers("/api/v1/users", "/api/v1/users/register").permitAll()  // Đăng nhập/đăng ký
                .requestMatchers("/api/ws/**").permitAll()                               // WebSocket
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()        // API docs
                .requestMatchers("/uploads/**", "/images/**").permitAll()                // Static files (ảnh)
                
                // PROTECTED ENDPOINTS - Cần JWT token hợp lệ
                .anyRequest().authenticated()
            )
            
            // Thêm JWT filter TRƯỚC UsernamePasswordAuthenticationFilter
            // Thứ tự quan trọng: JWT filter chạy trước để set authentication
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
