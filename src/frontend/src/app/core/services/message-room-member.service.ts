import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { MessageRoomMember } from '../interfaces/message-room-member';

@Injectable({
  providedIn: 'root'
})
export class MessageRoomMemberService {
  // API để thao tác với thành viên trong phòng chat
  private apiUrl = environment.apiUrl + environment.apiVersion + 'messageroommember';



  constructor(
    private http: HttpClient,
  ) { }

  /*
   * Cập nhật thời điểm "lastSeen" của 1 thành viên trong 1 phòng
   * Dùng khi user mở phòng chat  mark là đã xem tin nhắn
   */
  
  updateLastSeen(roomId?: string, username?: string): Observable<MessageRoomMember> {
    const url = this.apiUrl + '/update-last-seen/' + roomId + '/' + username;
    return this.http.post<MessageRoomMember>(url, {});
  }


  //Thêm danh sách thành viên vào 1 phòng chat (dùng cho nhóm)
  addMembers(roomId?: string, members?: MessageRoomMember[]): Observable<MessageRoomMember[]> {
    const url = this.apiUrl + '/add-members/' + roomId;
    return this.http.post<MessageRoomMember[]>(url, members);
  }


  //Xóa 1 thành viên khỏi phòng chat
  removeMember(roomId?: string, memberId?: string): Observable<Boolean> {
    const url = this.apiUrl + '/remove-member/' + roomId + '/' + memberId;
    return this.http.delete<Boolean>(url, {});
  }


  //Gán quyền admin cho 1 thành viên
  makeAdmin(roomId?: string, memberId?: string): Observable<MessageRoomMember> {
    const url = this.apiUrl + '/make-admin/' + roomId + '/' + memberId;
    return this.http.post<MessageRoomMember>(url, {});
  }


  //Gỡ quyền admin của 1 thành viên
  removeAdmin(roomId?: string, memberId?: string): Observable<MessageRoomMember> {
    const url = this.apiUrl + '/remove-admin/' + roomId + '/' + memberId;
    return this.http.post<MessageRoomMember>(url, {});
  }

}
