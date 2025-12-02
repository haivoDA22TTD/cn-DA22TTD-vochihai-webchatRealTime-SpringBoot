import { MessageContent } from "./message-content";
import { MessageRoomMember } from "./message-room-member";
// Interface đại diện cho một phòng chat
export interface MessageRoom {
    // ID của phòng chat
  id?: string;
  // Tên phòng chat (dùng cho nhóm hoặc phòng đặt tên)
  name?: string;
  // Phòng có phải là nhóm hay không
  isGroup?: boolean;
  // Thời gian tạo phòng (định dạng ISO string)
  createdDate?: string;
  // ID của người tạo phòng
  createdById?: string;
   // Tin nhắn cuối cùng được gửi trong phòng
  lastMessage?: MessageContent;
   // Danh sách thành viên trong phòng
  members?: MessageRoomMember[];
   // Danh sách các tin nhắn trong phòng
  messages?: MessageContent[];
  // Số lượng tin nhắn chưa xem của người dùng hiện tại
  unseenCount?: number;
// Người dùng hiện tại có phải là admin của phòng hay không
  isAdmin?: boolean;
}
