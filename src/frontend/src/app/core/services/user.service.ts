import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CompatClient, Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { MessageRoomMember } from '../interfaces/message-room-member';
import { MessageRoom } from '../interfaces/message-room';
import { TimeAgoPipe } from '../pipes/time-ago.pipe';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // API REST cho User
 private apiUrl = environment.apiUrl + environment.apiVersion + 'users';
 // WebSocket endpoint
  private webSocketUrl = environment.apiUrl + environment.webSocketUrl;
  // STOMP client dùng cho WebSocket
  private stompClient: CompatClient = {} as CompatClient;
  // Subscription lắng nghe danh sách user đang hoạt động
  private subscriptionActiveUsers: any;
  // Subject phát ra user đang hoạt động (online/offline)
  private activeUsersSubject = new Subject<User>();
  // Map trạng thái user
  activeUsers: {
    [key: string]: string;
  } = {
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE'
  }


  constructor(
    private http: HttpClient,
    private timeAgoPipe: TimeAgoPipe,   // Dùng để format "time ago"
  ) { }

  //Gửi yêu cầu login đến API
  login(user: User): Observable<User> {
    return this.http.post(this.apiUrl, user);
  }

  //Lưu user vào localStorage (chỉ lưu username & avatar)
  saveToLocalStorage(user: User) {
    localStorage.setItem('user', JSON.stringify({
      username: user.username,
      avatarUrl: user.avatarUrl
    }));
  }

  // Lấy user từ localStorage
  getFromLocalStorage(): User {
    return JSON.parse(localStorage.getItem('user') ?? '{}');
  }


  //Xóa user khỏi localStorage
  removeFromLocalStorage() {
    localStorage.removeItem('user');
  }


  //Kết nối WebSocket
  connect(user: User) {
    const socket = new SockJS(this.webSocketUrl);
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect(
      {},
      () => this.onConnect(user),   // kết nối thành công
      (error: any) => console.log(error)    // kết nối thất bại
    );
  }

  //Sau khi kết nối → subscribe active users + gửi thông báo "user connect"
  private onConnect(user: User) {
    this.subscribeActive();
    this.sendConnect(user);
  }

  // Subscribe WebSocket để nhận danh sách user active
  private subscribeActive() {
    this.subscriptionActiveUsers = this.stompClient.subscribe('/topic/active', (message: any) => {
      const user = JSON.parse(message.body);
      console.log(user);
      this.activeUsersSubject.next(user);   // phát ra cho component
    });
  }

  //Gửi thông báo user connect lên server
  sendConnect(user: User) {
    this.stompClient.send(
      '/app/user/connect',
      {},
      JSON.stringify(user)
    );
  }

  //Ngắt kết nối WebSocket
  disconnect(user: User) {
    this.sendDisconnect(user);
    this.stompClient.disconnect(() => {
      console.log('disconnect');
    });
    this.subscriptionActiveUsers?.unsubscribe();
  }


  //Gửi thông báo user disconnect lên server
  sendDisconnect(user: User) {
    this.stompClient.send(
      '/app/user/disconnect',
      {},
      JSON.stringify(user)
    );
  }

  //Observable để component subscribe danh sách user online/offline
  subscribeActiveUsers(): Observable<User> {
    return this.activeUsersSubject.asObservable();
  }


  // Lấy danh sách user online từ API
  getOnlineUsers(): Observable<User[]> {
    const url = this.apiUrl + '/online';
    return this.http.get<User[]>(url);
  }


  //Check trạng thái online của 1 user theo username
  getUserStatus(username?: string): boolean {
    if(!username) return false;
    return this.activeUsers[username] === 'ONLINE';
  }


  //Tìm user theo username (gợi ý tìm kiếm)
  searchUsersByUsername(username: string): Observable<User[]> {
    const url = this.apiUrl + '/search/' + username;
    return this.http.get<User[]>(url);
  }


  /*
   * Lấy trạng thái hiển thị của phòng chat
   * - Nếu có người online → "Online"
   * - Nếu là group → "Offline"
   * - Nếu là chat 1-1 → dùng timeAgoPipe hiển thị lần cuối online
   */
  getRoomStatus(room: MessageRoom): string {
    const members = room?.members?.filter(m => m.username != this.getFromLocalStorage().username);
    const membersOnline = members?.filter(m => this.getUserStatus(m.username));

    if(membersOnline && membersOnline.length > 0) {
      return 'Online';
    }

    if(room.isGroup) {
      return 'Offline';
    }
    else {
      return this.timeAgoPipe.transform(members?.[0]?.lastLogin) ?? '';
    }
  }


  //Upload avatar user
  uploadAvatar(formData: FormData): Observable<User> {
    const url = this.apiUrl + '/avatar';
    return this.http.post<User>(url, formData);
  }

}
