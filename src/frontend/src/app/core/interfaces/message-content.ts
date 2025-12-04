// Thông tin của một tin nhắn trong phòng chat
export interface MessageContent {
   // ID của tin nhắn
  id?: string;
   // Nội dung tin nhắn
  content?: string;
   // Thời điểm gửi tin (định dạng ISO string)
  dateSent?: string;
    // Loại tin nhắn 
  messageType?: MessageType;
  // ID của phòng chat chứa tin nhắn này
  messageRoomId?: string;
  // Username của người gửi tin nhắn
  sender?: string;
}
  // Các loại tin nhắn có thể có
export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE'
}
