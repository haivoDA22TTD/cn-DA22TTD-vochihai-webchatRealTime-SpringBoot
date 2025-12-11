/**
 * Interface đại diện cho một tin nhắn trong phòng chat
 * 
 * Sử dụng trong:
 * - Gửi tin nhắn qua WebSocket
 * - Nhận tin nhắn từ WebSocket
 * - Hiển thị danh sách tin nhắn
 * - Lưu trữ trong database (bảng message_content)
 */
export interface MessageContent {
  /** ID duy nhất của tin nhắn - UUID tự động tạo bởi server */
  id?: string;
  
  /**
   * Nội dung tin nhắn - Ý nghĩa phụ thuộc vào messageType:
   * - TEXT: Nội dung văn bản
   * - IMAGE: URL của ảnh (ví dụ: /images/messages/abc.jpg)
   * - LOCATION: Tọa độ GPS "latitude,longitude" (ví dụ: "10.762,106.660")
   */
  content?: string;
  
  /** Thời điểm gửi tin - ISO 8601 format (ví dụ: "2024-01-15T10:30:00Z") */
  dateSent?: string;
  
  /** Loại tin nhắn: TEXT, IMAGE, hoặc LOCATION */
  messageType?: MessageType;
  
  /** ID của phòng chat chứa tin nhắn này - Foreign key đến message_room */
  messageRoomId?: string;
  
  /** Username của người gửi - Foreign key đến user */
  sender?: string;
}

/**
 * Enum định nghĩa các loại tin nhắn
 * 
 * Giá trị phải khớp với enum MessageType trong backend
 */
export enum MessageType {
  /** Tin nhắn văn bản thông thường */
  TEXT = 'TEXT',
  
  /** Tin nhắn hình ảnh - content chứa URL ảnh */
  IMAGE = 'IMAGE',
  
  /**
   * Tin nhắn chia sẻ vị trí GPS
   * content chứa tọa độ "lat,lng"
   * Frontend hiển thị Google Maps embed với marker tại vị trí đó
   */
  LOCATION = 'LOCATION'
}
