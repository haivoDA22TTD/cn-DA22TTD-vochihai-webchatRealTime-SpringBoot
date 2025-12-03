import { Pipe, PipeTransform } from '@angular/core';
import { MessageRoom } from '../interfaces/message-room';
import { UserService } from '../services/user.service';
import { User } from '../interfaces/user';

@Pipe({
  name: 'messageRoomName'
})
export class MessageRoomNamePipe implements PipeTransform {
// Lấy thông tin user hiện tại từ localStorage
  currentUser: User = this.userService.getFromLocalStorage();


  constructor(
    private userService: UserService,
  ) {}
  /**
   * Trả về tên hiển thị của phòng chat
   * - Nếu phòng có name trả về name
   * - Nếu không:
   *     Nếu là phòng nhóm liệt kê tên tất cả thành viên
   *     Nếu là chat 1-1 lấy tên người còn lại 
   */
  transform(room?: MessageRoom): string | undefined {
    if(!room) return '';
// Nếu phòng chat đã có đặt tên dùng tên đó
    if(room.name) {
      return room.name;
    }
    else {
      // Nếu không có tên → auto tạo tên từ danh sách thành viên
      return room.members?.filter(m => {
        // Nếu là group lấy tất cả thành viên
          // Nếu là chat riêng lấy người khác currentUser
        if(room.isGroup || m.username !== this.currentUser.username) {
          return m;
        }
        return null;
      })
      .map(u => u.username) // Lấy username của từng user
      .join(', ');  // Ghép thành chuỗi
    }
  }

}

