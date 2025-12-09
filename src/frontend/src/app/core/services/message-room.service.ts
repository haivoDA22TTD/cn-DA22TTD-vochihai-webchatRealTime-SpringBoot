import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MessageRoom } from '../interfaces/message-room';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MessageRoomService {
    // API dùng để thao tác với MessageRoom
  private apiUrl = environment.apiUrl + environment.apiVersion + 'messagerooms';



  constructor(
    private http: HttpClient,
  ) { }

  /*
   * Tìm phòng chat giữa các thành viên
   * - Dùng khi muốn kiểm tra xem đã có phòng chat 1-1 hoặc nhóm chưa
   * - truyền danh sách username vào
   * - Backend sẽ tìm phòng mà tất cả user đó đều là thành viên
   */

  findMessageRoomByMembers(members: string[]): Observable<MessageRoom> {
    const url = this.apiUrl + '/find-chat-room';
    const params = {
      members: members    // dạng array backend nhận dạng list
    };
    return this.http.get<MessageRoom>(url, { params });
  }


  /**
   * Tạo phòng chat mới
   *  currentUsername: người đang tạo phòng
   *  members: danh sách người được thêm vào
   *  members được join thành chuỗi
   */
  createChatRoom(currentUsername: string, members: string[]): Observable<MessageRoom> {
    const url = this.apiUrl + '/create-chat-room';
    const params = new HttpParams()
                        .set('username', currentUsername)
                        .set('members', members.join(','));
    return this.http.post(url, null, { params })
  }


  /*
   * Lấy danh sách phòng chat của user mà có ít nhất 1 tin nhắn
   * → dùng để hiển thị danh sách phòng chat ở sidebar
   */
  
  findMessageRoomAtLeastOneContent(username: string): Observable<MessageRoom[]> {
    const url = this.apiUrl + '/find-chat-room-at-least-one-content/' + username;
    return this.http.get<MessageRoom[]>(url);
  }



  //Lấy thông tin chi tiết của 1 phòng chat theo roomId
  findById(roomId?: string): Observable<MessageRoom> {
    const url = this.apiUrl + '/' + roomId;
    return this.http.get<MessageRoom>(url);
  }


  /**
   * Đổi tên nhóm chat
   * @param roomId ID của phòng chat
   * @param newName Tên mới của phòng chat
   */
  renameRoom(roomId: string, newName: string): Observable<MessageRoom> {
    const url = `${this.apiUrl}/${roomId}/rename`;
    const params = new HttpParams().set('newName', newName);
    return this.http.put<MessageRoom>(url, null, { params });
  }

}
