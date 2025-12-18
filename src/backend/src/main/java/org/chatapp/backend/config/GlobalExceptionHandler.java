package org.chatapp.backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Map;

/**
 * Global Exception Handler
 * Xử lý các exception chung cho toàn bộ ứng dụng
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Xử lý lỗi khi file upload vượt quá kích thước cho phép
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e) {
        System.err.println("File upload size exceeded: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(
            Map.of(
                "error", "File quá lớn",
                "message", "Kích thước file vượt quá giới hạn cho phép (50MB).\n\nVui lòng chọn file nhỏ hơn."
            )
        );
    }
}
