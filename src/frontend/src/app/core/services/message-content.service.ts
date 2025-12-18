import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CompatClient, Stomp } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../interfaces/user';
import * as SockJS from 'sockjs-client';
import { MessageContent } from '../interfaces/message-content';
import { MessageRoom } from '../interfaces/message-room';

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
  // Subscription để lắng nghe cập nhật phòng chat (ảnh nền, tên, ...)
  private subscriptionRoomUpdates: any;
  // Subject phát ra message mới
  private messagesSubject = new Subject<MessageContent>();
  // Subject phát ra lỗi WebSocket
  private errorSubject = new Subject<string>();
  // Subject phát ra cập nhật phòng chat
  private roomUpdatesSubject = new Subject<MessageRoom>();
    // Kết nối đến WebSocket server 
  constructor(private http: HttpClient) { }

  connect(user: User) {
    const socket = new SockJS(this.webSocketUrl);
    this.stompClient = Stomp.over(socket);
    
    // Tắt debug log của STOMP
    this.stompClient.debug = () => {};

    this.stompClient.connect(
      {},   // header
      () => this.onConnect(user),   // kết nối thành công
      (error: any) => {             // kết nối thất bại
        console.error('WebSocket connection error:', error);
        this.errorSubject.next('Không thể kết nối đến server. Vui lòng thử lại.');
      }
    );
  }
  //Khi kết nối thành công  đăng ký nhận tin nhắn + lỗi + cập nhật phòng
  private onConnect(user: User) {
    console.log('WebSocket connected for user:', user.username);
    this.subscribeMessages(user);
    this.subscribeErrors(user);
    this.subscribeRoomUpdates(user); // Subscribe để nhận cập nhật phòng chat (ảnh nền, ...)
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
    console.log('Subscribing to errors for user:', user.username);
    this.subscriptionErrors = this.stompClient.subscribe(
      `/user/${user.username}/queue/errors`,
      (message: any) => {
        console.log('Error message received from WebSocket:', message.body);
        const errorMessage = message.body;
        this.errorSubject.next(errorMessage);   // phát lỗi ra ngoài
      }
    );
  }

  // Lắng nghe cập nhật phòng chat (ảnh nền, tên, ...) từ WebSocket
  private subscribeRoomUpdates(user: User) {
    console.log('Subscribing to room updates for user:', user.username);
    this.subscriptionRoomUpdates = this.stompClient.subscribe(
      `/user/${user.username}/queue/room-updates`,
      (message: any) => {
        console.log('Room update received from WebSocket:', message.body);
        const roomUpdate = JSON.parse(message.body);
        this.roomUpdatesSubject.next(roomUpdate);
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

  /**
   * Upload file đính kèm lên server
   * Chỉ cho phép: .docx, .pptx, .xlsx, .xls, .pdf, .zip, .rar
   * @param file - File cần upload
   * @returns Observable chứa thông tin file {url, name, size, extension}
   */
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${this.apiUrl}/upload-file`;
    return this.http.post(url, formData);
  }

  /**
   * Danh sách các định dạng file được phép
   */
  readonly ALLOWED_FILE_EXTENSIONS = ['.docx', '.pptx', '.xlsx', '.xls', '.pdf', '.zip', '.rar'];

  /**
   * Kiểm tra file có được phép upload không
   * @param fileName - Tên file
   * @returns true nếu được phép, false nếu không
   */
  isFileAllowed(fileName: string): boolean {
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    return this.ALLOWED_FILE_EXTENSIONS.includes(extension);
  }

  /**
   * Lấy extension của file
   */
  getFileExtension(fileName: string): string {
    return fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  }

  /**
   * Trích xuất URL đầu tiên từ text
   * Trả về URL nếu tìm thấy, null nếu không
   */
  extractFirstUrl(text: string): string | null {
    // Tạo regex mới mỗi lần để tránh vấn đề với lastIndex
    const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i;
    const match = text.match(urlPattern);
    return match ? match[0] : null;
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
    if (this.subscriptionRoomUpdates) {
      this.subscriptionRoomUpdates.unsubscribe();
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

  // Observable để nhận cập nhật phòng chat (ảnh nền, tên, ...)
  subscribeRoomUpdatesObservable(): Observable<MessageRoom> {
    return this.roomUpdatesSubject.asObservable();
  }

  //Lấy lịch sử tin nhắn theo room từ REST API
  getMessagesByRoomId(roomId?: string): Observable<MessageContent[]> {
    const url = `${this.apiUrl}/${roomId}`;
    return this.http.get<MessageContent[]>(url);
  }
}