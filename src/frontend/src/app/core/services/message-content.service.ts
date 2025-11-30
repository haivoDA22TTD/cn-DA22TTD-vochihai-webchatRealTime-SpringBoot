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
 private apiUrl = environment.apiUrl + environment.apiVersion + 'messagecontents';
 
  private webSocketUrl = environment.apiUrl + environment.webSocketUrl;
  private stompClient: CompatClient = {} as CompatClient;
  private subscriptionMessages: any;
  private subscriptionErrors: any;
  
  private messagesSubject = new Subject<MessageContent>();
  private errorSubject = new Subject<string>();

  constructor(private http: HttpClient) { }

  connect(user: User) {
    const socket = new SockJS(this.webSocketUrl);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect(
      {},
      () => this.onConnect(user),
      (error: any) => {
        console.error('WebSocket connection error:', error);
        alert('Failed to connect to WebSocket. Please try again.');
      }
    );
  }

  private onConnect(user: User) {
    this.subscribeMessages(user);
    this.subscribeErrors(user); // Thêm subscription để nhận thông báo lỗi
  }

  private subscribeMessages(user: User) {
    this.subscriptionMessages = this.stompClient.subscribe(
      `/user/${user.username}/queue/messages`,
      (message: any) => {
        const msg = JSON.parse(message.body);
        this.messagesSubject.next(msg);
      }
    );
  }

  private subscribeErrors(user: User) {
    this.subscriptionErrors = this.stompClient.subscribe(
      `/user/${user.username}/queue/errors`,
      (message: any) => {
        const errorMessage = message.body;
        this.errorSubject.next(errorMessage);
      }
    );
  }

  sendMessage(messageContent: MessageContent) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send(
        '/app/send-message',
        {},
        JSON.stringify(messageContent)
      );
    } else {
      console.error('STOMP client is not connected');
      // Có thể phát ra lỗi qua errorSubject nếu cần
      this.errorSubject.next('Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối.');
    }
  }

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

  subscribeMessagesObservable(): Observable<MessageContent> {
    return this.messagesSubject.asObservable();
  }

  // Thêm method để subscribe nhận thông báo lỗi
  subscribeErrorsObservable(): Observable<string> {
    return this.errorSubject.asObservable();
  }

  getMessagesByRoomId(roomId?: string): Observable<MessageContent[]> {
    const url = `${this.apiUrl}/${roomId}`;
    return this.http.get<MessageContent[]>(url);
  }
}