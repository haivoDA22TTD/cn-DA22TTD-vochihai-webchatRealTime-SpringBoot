import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CompatClient, Stomp } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../interfaces/user';
import * as SockJS from 'sockjs-client';
import { MessageContent } from '../interfaces/message-content';

@Injectable({
  providedIn: 'root'
})
export class MessageContentService {
  // API REST để lấy message theo room ID
  private apiUrl = environment.apiUrl + environment.apiVersion + 'messagecontents';
   // WebSocket endpoint từ backend
  private webSocketUrl = environment.apiUrl + environment.webSocketUrl;
   // STOMP client
  private stompClient: CompatClient = {} as CompatClient;
  // Subscription để lắng nghe tin nhắn
  private subscriptionMessages: any;
   // Subscription để lắng nghe lỗi từ WebSocket
  private subscriptionErrors: any;
   // Subject phát ra message mới
  private messagesSubject = new Subject<MessageContent>();
  // Subject phát ra lỗi WebSocket
  private errorSubject = new Subject<string>();
    // Kết nối đến WebSocket server 
  constructor(private http: HttpClient) { }

  connect(user: User) {
    const socket = new SockJS(this.webSocketUrl);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect(
      {},   // header
      () => this.onConnect(user),   // kết nối thành công
      (error: any) => {             // kết nối thất bại
        console.error('WebSocket connection error:', error);
        alert('Failed to connect to WebSocket. Please try again.');
      }
    );
  }
  //Khi kết nối thành công  đăng ký nhận tin nhắn + lỗi
  private onConnect(user: User) {
    this.subscribeMessages(user);
    this.subscribeErrors(user); // Thêm subscription để nhận thông báo lỗi
  }
  //Lắng nghe tin nhắn đến từ WebSocket
  private subscribeMessages(user: User) {
    this.subscriptionMessages = this.stompClient.subscribe(
      `/user/${user.username}/queue/messages`,    // queue dành riêng cho user
      (message: any) => {
        const msg = JSON.parse(message.body);
        this.messagesSubject.next(msg);           // phát message ra ngoài
      }
    );
  }
  //Lắng nghe lỗi server gửi về WebSocket (nếu có)
  private subscribeErrors(user: User) {
    this.subscriptionErrors = this.stompClient.subscribe(
      `/user/${user.username}/queue/errors`,
      (message: any) => {
        const errorMessage = message.body;
        this.errorSubject.next(errorMessage);   // phát lỗi ra ngoài
      }
    );
  }
  //Gửi tin nhắn đến server qua WebSocket
  sendMessage(messageContent: MessageContent) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send(
        '/app/send-message',    // endpoint mapping ở backend
        {},
        JSON.stringify(messageContent)
      );
    } else {
      console.error('STOMP client không kết nối');
      // Bắn lỗi để UI show thông báo
      this.errorSubject.next('Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối.');
    }
  }
  
  //Upload ảnh lên server
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${this.apiUrl}/upload-image`;
    return this.http.post(url, formData, { responseType: 'text' });
  }
  //Ngắt kết nối WebSocket + hủy subscriptions
  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('Disconnected from WebSocket');
      });
    }
    if (this.subscriptionMessages) {
      this.subscriptionMessages.unsubscribe();
    }
    if (this.subscriptionErrors) {
      this.subscriptionErrors.unsubscribe();
    }
  }
  //Observable để component subscribe và nhận message
  subscribeMessagesObservable(): Observable<MessageContent> {
    return this.messagesSubject.asObservable();
  }

  //Observable để nhận thông báo lỗi WebSocket
  subscribeErrorsObservable(): Observable<string> {
    return this.errorSubject.asObservable();
  }
  //Lấy lịch sử tin nhắn theo room từ REST API
  getMessagesByRoomId(roomId?: string): Observable<MessageContent[]> {
    const url = `${this.apiUrl}/${roomId}`;
    return this.http.get<MessageContent[]>(url);
  }
}