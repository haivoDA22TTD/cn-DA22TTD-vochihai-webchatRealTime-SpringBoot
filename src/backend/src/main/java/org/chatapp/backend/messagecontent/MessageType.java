package org.chatapp.backend.messagecontent;

/**
 * Enum định nghĩa các loại tin nhắn
 * 
 * Được lưu trong database dưới dạng STRING (EnumType.STRING)
 * Ví dụ: cột message_type sẽ chứa "TEXT", "IMAGE", "LOCATION", "FILE", "LINK"
 */
public enum MessageType {
    /**
     * Tin nhắn văn bản thông thường
     * content: Nội dung text
     */
    TEXT,
    
    /**
     * Tin nhắn hình ảnh
     * content: URL của ảnh (ví dụ: /images/messages/abc123.jpg)
     */
    IMAGE,
    
    /**
     * Tin nhắn chia sẻ vị trí GPS
     * content: Tọa độ dạng "latitude,longitude" (ví dụ: "10.762622,106.660172")
     * Frontend sẽ parse và hiển thị Google Maps embed
     */
    LOCATION,
    
    /**
     * Tin nhắn gửi file đính kèm
     * content: JSON chứa thông tin file
     * Format: {"url": "/images/messages/abc.pdf", "name": "document.pdf", "size": 1024}
     * Chỉ cho phép: .docx, .pptx, .xlsx, .pdf, .zip, .rar
     */
    FILE,
    
    /**
     * Tin nhắn chứa link
     * content: JSON chứa thông tin link preview
     * Format: {"url": "https://...", "title": "...", "description": "...", "image": "..."}
     */
    LINK
}
