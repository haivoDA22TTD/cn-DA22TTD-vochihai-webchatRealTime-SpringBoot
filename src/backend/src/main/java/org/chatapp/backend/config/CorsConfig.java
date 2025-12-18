package org.chatapp.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Cấu hình CORS (Cross-Origin Resource Sharing)
 * 
 * CORS là cơ chế bảo mật của trình duyệt, ngăn chặn request từ domain khác.
 * Ví dụ: Frontend chạy ở localhost:4200, Backend ở localhost:8080
 * → Trình duyệt sẽ chặn request nếu không có CORS config.
 * 
 * Class này cho phép Frontend gọi API Backend từ các domain được chỉ định.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    /**
     * Cấu hình CORS mappings cho toàn bộ ứng dụng
     * @param registry - Registry để đăng ký CORS config
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // Áp dụng cho tất cả các endpoint
                .allowedOrigins(
                    "http://localhost:4200",      // Angular dev server (ng serve)
                    "http://localhost",           // Docker frontend (Nginx)
                    "http://localhost:80",        // Docker frontend (port 80)
                    "http://localhost:8080",      // Backend (Swagger UI)
                    "http://127.0.0.1:4200",      // Localhost dạng IP
                    "http://127.0.0.1",           // Localhost dạng IP
                    "http://127.0.0.1:8080"       // Backend dạng IP
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")  // Các HTTP method được phép
                .allowedHeaders("*")              // Cho phép tất cả headers
                .exposedHeaders("*")              // Expose tất cả headers cho client
                .allowCredentials(true)           // Cho phép gửi cookie/token
                .maxAge(3600);                    // Cache preflight request 1 giờ
    }
}
