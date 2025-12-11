package org.chatapp.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Cấu hình WebSocket với STOMP protocol
 * 
 * WebSocket: Giao thức cho phép giao tiếp 2 chiều (bidirectional) giữa client và server
 * STOMP (Simple Text Oriented Messaging Protocol): Protocol chạy trên WebSocket,
 *        cung cấp các lệnh: CONNECT, SUBSCRIBE, SEND, UNSUBSCRIBE, DISCONNECT
 * 
 * Luồng hoạt động:
 * 1. Client kết nối WebSocket tại /api/ws
 * 2. Client subscribe vào các topic (ví dụ: /topic/room/123)
 * 3. Client gửi tin nhắn đến /app/chat.send
 * 4. Server xử lý và broadcast đến các subscriber
 */
@Configuration
@EnableWebSocketMessageBroker  // Bật WebSocket message broker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    /**
     * Đăng ký endpoint WebSocket
     * Client sẽ kết nối tại: ws://localhost:8080/api/ws
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/api/ws")       // Endpoint kết nối WebSocket
                .setAllowedOriginPatterns("*") // Cho phép tất cả origin (CORS)
                .withSockJS();                 // Fallback cho trình duyệt không hỗ trợ WebSocket
    }

    /**
     * Cấu hình Message Broker
     * Message Broker: Trung gian nhận và phân phối tin nhắn
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Bật Simple Broker cho các destination bắt đầu bằng /topic và /user
        // Client subscribe: /topic/room/123, /user/queue/errors
        registry.enableSimpleBroker("/topic", "/user");
        
        // Prefix cho destination mà client gửi tin nhắn đến
        // Client send: /app/chat.send → Server xử lý tại @MessageMapping("/chat.send")
        registry.setApplicationDestinationPrefixes("/app");
        
        // Prefix cho tin nhắn gửi đến user cụ thể
        // Server gửi: /user/{username}/topic/room/123
        registry.setUserDestinationPrefix("/user");
    }
}
