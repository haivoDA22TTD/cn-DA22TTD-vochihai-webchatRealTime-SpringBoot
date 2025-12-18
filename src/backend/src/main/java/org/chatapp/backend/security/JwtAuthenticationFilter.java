package org.chatapp.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

/**
 * Filter xác thực JWT cho mỗi HTTP request
 * 
 * OncePerRequestFilter: Đảm bảo filter chỉ chạy 1 lần cho mỗi request
 * (tránh chạy lại khi forward/include)
 * 
 * Luồng xử lý:
 * 1. Lấy header "Authorization" từ request
 * 2. Kiểm tra có phải format "Bearer <token>" không
 * 3. Trích xuất và validate token
 * 4. Nếu hợp lệ → set Authentication vào SecurityContext
 * 5. Tiếp tục filter chain
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;  // Service xử lý JWT

    /**
     * Bỏ qua filter cho các endpoint public (Swagger, WebSocket, etc.)
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/swagger-ui") ||
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/swagger-resources") ||
               path.startsWith("/webjars") ||
               path.startsWith("/api/ws") ||
               path.equals("/api/v1/users") ||
               path.equals("/api/v1/users/register");
    }

    /**
     * Xử lý filter cho mỗi request
     * @param request - HTTP request
     * @param response - HTTP response
     * @param filterChain - Chuỗi filter tiếp theo
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        // 1. Lấy header Authorization
        // Format: "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // 2. Kiểm tra header có tồn tại và đúng format không
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Không có token → tiếp tục filter chain (có thể là public endpoint)
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Trích xuất token (bỏ prefix "Bearer ")
        jwt = authHeader.substring(7);  // "Bearer ".length() = 7
        
        try {
            // 4. Trích xuất username từ token
            username = jwtService.extractUsername(jwt);

            // 5. Kiểm tra: có username VÀ chưa có authentication trong context
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // 6. Validate token
                if (jwtService.isTokenValid(jwt, username)) {
                    // 7. Tạo Authentication object
                    // UsernamePasswordAuthenticationToken: Implementation của Authentication interface
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username,           // Principal (user identity)
                            null,               // Credentials (không cần vì đã xác thực qua JWT)
                            new ArrayList<>()   // Authorities/Roles (để trống vì không dùng role-based auth)
                    );
                    
                    // 8. Set thêm details (IP, session ID, etc.)
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // 9. Lưu Authentication vào SecurityContext
                    // Các filter/controller sau có thể lấy user info từ đây
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token không hợp lệ (expired, sai signature, etc.)
            // Không throw exception, để request tiếp tục
            // SecurityConfig sẽ xử lý nếu endpoint cần authentication
        }

        // 10. Tiếp tục filter chain
        filterChain.doFilter(request, response);
    }
}
