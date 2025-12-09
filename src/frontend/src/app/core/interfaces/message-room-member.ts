// Thông tin một thành viên trong phòng chat
export interface MessageRoomMember {
// ID của phòng chat mà thành viên này thuộc về
  messageRoomId?: string;
// Tên đăng nhập của thành viên
  username?: string;
// Thành viên này có phải là admin của phòng hay không
  isAdmin?: boolean;
// Thời điểm thành viên cuối cùng xem tin nhắn (ISO string)  
  lastSeen?: string;
 // Thời điểm thành viên đăng nhập gần nhất (ISO string)
  lastLogin?: string;
// Đường dẫn ảnh đại diện của thành viên
  avatarUrl?: string;
}
