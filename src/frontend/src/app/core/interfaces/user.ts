// Interface đại diện cho thông tin của một người dùng
export interface User {
  // Tên đăng nhập của người dùng 
  username?: string,
  // Mật khẩu của người dùng 
  password?: string,
  // Trạng thái hoạt động của người dùng (ONLINE hoặc OFFLINE)
  status?: Status,
   // Đường dẫn ảnh đại diện của người dùng
  avatarUrl?: string
}

// Interface cho response đăng nhập
export interface LoginResponse {
  username?: string;
  avatarUrl?: string;
  status?: Status;
  token?: string;
  success: boolean;
  message?: string;
  remainingAttempts?: number;
  lockTimeMinutes?: number;
}

// Enum mô tả các trạng thái của người dùng
export enum Status {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE'
}
