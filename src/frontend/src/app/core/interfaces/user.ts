/**
 * Interface đại diện cho thông tin của một người dùng
 * 
 * Sử dụng trong:
 * - Form đăng nhập (username, password)
 * - Hiển thị thông tin user (username, avatarUrl, status)
 * - WebSocket messages
 * 
 * Tất cả fields đều optional (?) vì không phải lúc nào cũng cần đầy đủ
 */
export interface User {
  /** Tên đăng nhập - Primary key trong database */
  username?: string,
  
  /** Mật khẩu - Chỉ dùng khi đăng nhập, không lưu ở client */
  password?: string,
  
  /** Trạng thái hoạt động: ONLINE hoặc OFFLINE */
  status?: Status,
  
  /** URL ảnh đại diện - Đường dẫn tuyệt đối từ server */
  avatarUrl?: string,
  
  /** Thời điểm đăng nhập cuối - Dùng để hiển thị "Online 5 phút trước" */
  lastLogin?: Date
}

/**
 * Interface cho response từ API đăng nhập
 * 
 * Trả về từ: POST /api/v1/users
 * 
 * Các trường hợp:
 * 1. Đăng nhập thành công: success=true, có token, username, avatarUrl
 * 2. Sai mật khẩu: success=false, có message, remainingAttempts
 * 3. Tài khoản bị khóa: success=false, có message, lockTimeMinutes
 */
export interface LoginResponse {
  /** Tên đăng nhập - Trả về khi đăng nhập thành công */
  username?: string;
  
  /** URL ảnh đại diện */
  avatarUrl?: string;
  
  /** Trạng thái user */
  status?: Status;
  
  /** JWT Token - Dùng để xác thực các request sau */
  token?: string;
  
  /** Kết quả đăng nhập: true = thành công, false = thất bại */
  success: boolean;
  
  /** Thông báo lỗi (nếu có) - Hiển thị cho user */
  message?: string;
  
  /** Số lần thử còn lại (khi sai mật khẩu) */
  remainingAttempts?: number;
  
  /** Thời gian khóa còn lại (phút) - Khi tài khoản bị khóa */
  lockTimeMinutes?: number;
}

/**
 * Enum mô tả các trạng thái của người dùng
 * 
 * Giá trị phải khớp với enum UserStatus trong backend
 */
export enum Status {
  /** Đang online - Đang kết nối WebSocket */
  ONLINE = 'ONLINE',
  
  /** Offline - Đã ngắt kết nối */
  OFFLINE = 'OFFLINE'
}
