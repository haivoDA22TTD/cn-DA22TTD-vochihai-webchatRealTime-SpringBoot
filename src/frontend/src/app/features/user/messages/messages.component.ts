import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageContent, MessageType } from 'src/app/core/interfaces/message-content';
import { MessageRoom } from 'src/app/core/interfaces/message-room';
import { MessageRoomMember } from 'src/app/core/interfaces/message-room-member';
import { User } from 'src/app/core/interfaces/user';
import { MessageContentService } from 'src/app/core/services/message-content.service';
import { MessageRoomMemberService } from 'src/app/core/services/message-room-member.service';
import { MessageRoomService } from 'src/app/core/services/message-room.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { UserService } from 'src/app/core/services/user.service';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy{

  currentUser: User = {};
  activeUsersSubscription: any;
  isShowDialogChat: boolean = false;
  selectedMessageRoom: MessageRoom = {};
  messageToSend: MessageContent = {};
  messageRooms: MessageRoom[] = [];
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  // File upload
  selectedFile: File | null = null;
  isShowFileErrorDialog: boolean = false;
  fileErrorMessage: string = '';

  // Location error dialog
  isShowLocationErrorDialog: boolean = false;
  locationErrorMessage: string = '';

  // Thêm thuộc tính để hiển thị thông báo spam cụ thể
  isSpamBlocked: boolean = false;
  spamErrorMessage: string = '';
  isShowSpamDialog: boolean = false;

  // Chat background - upload từ thiết bị và đồng bộ cho tất cả thành viên
  isUploadingBackground: boolean = false;

  themeMode: boolean = false;
  themeColor = this.themeService.getGetThemeColorObject(this.themeService.themeColor);
  themeColors = this.themeService.themeColors;

  // Emoji picker
  @ViewChild('emojiPanel') emojiPanel!: OverlayPanel;
  emojis: string[] = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫',
    '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
    '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳',
    '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯',
    '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭',
    '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡',
    '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺',
    '👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞',
    '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'
  ];

  // Rename group
  isShowRenameDialog: boolean = false;
  newGroupName: string = '';

  // Location
  isGettingLocation: boolean = false;


  constructor(
    public userService: UserService,
    private messageRoomService: MessageRoomService,
    private messageContentService: MessageContentService,
    private router: Router,
    private messageRoomMemberService: MessageRoomMemberService,
    private themeService: ThemeService,
  ) {}


  ngOnInit() {
    this.currentUser = this.userService.getFromLocalStorage();
    
    // Subscribe to theme changes để cập nhật UI
    this.themeMode = this.themeService.themeMode === 'dark';
    
    this.themeService.themeMode$.subscribe(mode => {
      this.themeMode = mode === 'dark';
    });
    
    this.themeService.themeColor$.subscribe(color => {
      this.themeColor = this.themeService.getGetThemeColorObject(color);
    });

    this.userService.connect(this.currentUser);
    this.messageContentService.connect(this.currentUser);
    
    window.addEventListener('beforeunload', () => {
      this.userService.disconnect(this.currentUser);
    });

    this.findMessageRoomAtLeastOneContent();
    this.subscribeMessages();
    this.subscribeToErrorMessages();
    this.subscribeToRoomUpdates();
  }


  // Subscribe để nhận thông báo lỗi từ WebSocket (rate limit, etc.)
  subscribeToErrorMessages() {
    this.messageContentService.subscribeErrorsObservable().subscribe({
      next: (errorMessage: string) => {
        console.log('=== ERROR RECEIVED ===');
        console.log('Error:', errorMessage);
        console.log('======================');
        
        this.isSpamBlocked = true;
        this.spamErrorMessage = errorMessage;
        this.isShowSpamDialog = true; // Hiển thị dialog thay vì notification
      },
      error: (error: any) => {
        console.error('Error subscribing to errors:', error);
      }
    });
  }

  // Subscribe để nhận cập nhật phòng chat (ảnh nền, tên, ...) realtime
  subscribeToRoomUpdates() {
    this.messageContentService.subscribeRoomUpdatesObservable().subscribe({
      next: (roomUpdate: MessageRoom) => {
        console.log('=== ROOM UPDATE RECEIVED ===');
        console.log('Room ID:', roomUpdate.id);
        console.log('Background URL:', roomUpdate.backgroundUrl);
        console.log('============================');
        
        // Cập nhật phòng chat đang chọn nếu trùng ID
        if (this.selectedMessageRoom.id === roomUpdate.id) {
          this.selectedMessageRoom.backgroundUrl = roomUpdate.backgroundUrl;
          this.selectedMessageRoom.name = roomUpdate.name;
        }
        
        // Cập nhật trong danh sách rooms
        const roomIndex = this.messageRooms.findIndex(r => r.id === roomUpdate.id);
        if (roomIndex !== -1) {
          this.messageRooms[roomIndex].backgroundUrl = roomUpdate.backgroundUrl;
          this.messageRooms[roomIndex].name = roomUpdate.name;
        }
      },
      error: (error: any) => {
        console.error('Error subscribing to room updates:', error);
      }
    });
  }


  ngOnDestroy() {
    this.userService.disconnect(this.currentUser);
    this.messageContentService.disconnect();
  }



  chat(selectedUsers: User[]) {
    console.log(selectedUsers);
    this.isShowDialogChat = false;

    const usernames = selectedUsers.map(u => u.username).filter((u): u is string => u !== undefined);
    if(this.currentUser.username) usernames.push(this.currentUser.username);
    
    this.messageRoomService.findMessageRoomByMembers(usernames).subscribe({
      next: (foundMessageRoom: MessageRoom) => {
        console.log('foundMessageRoom', foundMessageRoom);
        
        if(!foundMessageRoom) {
          if(!this.currentUser.username) return;
         
          this.messageRoomService.createChatRoom(this.currentUser.username, usernames).subscribe({
            next: (createdMessageRoom: MessageRoom) => {
              console.log('createdMessageRoom', createdMessageRoom);
              this.messageRooms.unshift(createdMessageRoom);
              this.selectMessageRoom(createdMessageRoom);
            },
            error: (error) => {
              console.log(error);
            }
          });
        }
        else {
          const room = this.messageRooms.filter(r => r.id === foundMessageRoom.id)[0];
          if(room) {
            this.selectMessageRoom(room);
          }
          else {
            this.messageRooms.unshift(foundMessageRoom);
            this.selectMessageRoom(foundMessageRoom);
          }
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }



  selectMessageRoom(room: MessageRoom) {
    console.log(room);
    if(this.selectedMessageRoom.id) {
      this.updateLastSeen(this.selectedMessageRoom.id, this.currentUser.username);
    }
    this.selectedMessageRoom = room;
    if(this.selectedMessageRoom.id) {
      this.updateLastSeen(this.selectedMessageRoom.id, this.currentUser.username);
    }

    this.selectedMessageRoom.isAdmin = this.selectedMessageRoom.members?.filter(u => u.username === this.currentUser?.username && u.isAdmin)[0] ? true : false;

    this.getMessagesByRoomId();
  }



  getMessagesByRoomId() {
    this.messageContentService.getMessagesByRoomId(this.selectedMessageRoom.id).subscribe({
      next: (messages: MessageContent[]) => {
        this.selectedMessageRoom.messages = messages;
        this.scrollToBottom();
      }, error: (error: any) => {
        console.log(error);
      }
    });
  }



  subscribeMessages() {
    this.messageContentService.subscribeMessagesObservable().subscribe({
      next: (messageContent: MessageContent) => {
        console.log('=== MESSAGE RECEIVED ===');
        console.log('Content:', messageContent.content);
        console.log('MessageType:', messageContent.messageType);
        console.log('Sender:', messageContent.sender);
        console.log('========================');
        
        if(messageContent.messageRoomId === this.selectedMessageRoom.id) {
          this.selectedMessageRoom.lastMessage = messageContent;
          this.selectedMessageRoom.messages?.push(messageContent);
          this.scrollToBottom();
        }
        else {
          const roomToPush = this.messageRooms?.filter(r => r.id === messageContent.messageRoomId)[0];
          if(roomToPush) {
            roomToPush.lastMessage = messageContent;
            roomToPush.unseenCount = (roomToPush.unseenCount ?? 0) + 1; 
            this.messageRooms = this.messageRooms.filter(r => r.id !== messageContent.messageRoomId);
            this.messageRooms.unshift(roomToPush);
          }
          else {
            this.messageRoomService.findById(messageContent.messageRoomId).subscribe({
              next: (room: MessageRoom) => {
                room.lastMessage = messageContent;
                room.unseenCount = 1;
                this.messageRooms.unshift(room);
              }, error: (error: any) => {
                console.log(error);
              }
            });
          }
        }
      }, error: (error: any) => {
        console.log(error);
      }
    });
  }



 sendMessage() {
    // Nếu có ảnh được chọn, gửi ảnh
    if (this.selectedImage) {
      this.sendImageMessage();
      return;
    }

    // Kiểm tra nội dung tin nhắn có rỗng không
    if (!this.messageToSend.content || this.messageToSend.content.trim() === '') {
      return;
    }

    const content = this.messageToSend.content.trim();
    
    // Kiểm tra xem tin nhắn có chứa URL không
    const url = this.messageContentService.extractFirstUrl(content);
    
    if (url) {
      // Nếu có URL, gửi tin nhắn LINK (chỉ lưu URL, không cần preview)
      this.sendLinkMessage(url);
    } else {
      // Gửi tin nhắn TEXT bình thường
      const messageToSend: MessageContent = {
        content: content,
        messageRoomId: this.selectedMessageRoom.id,
        sender: this.currentUser.username,
        messageType: MessageType.TEXT
      };

      this.messageContentService.sendMessage(messageToSend);
    }
    
    // Reset các giá trị sau khi gửi
    this.messageToSend = {};
    this.isSpamBlocked = false;
    this.spamErrorMessage = '';
  }

  /**
   * Gửi tin nhắn chứa link
   * Lưu URL trực tiếp, frontend sẽ hiển thị link có thể click
   */
  sendLinkMessage(url: string) {
    console.log('Sending link message:', url);
    
    // Gửi tin nhắn LINK với URL trực tiếp (không cần JSON)
    const messageToSend: MessageContent = {
      content: url,
      messageRoomId: this.selectedMessageRoom.id,
      sender: this.currentUser.username,
      messageType: MessageType.LINK
    };

    this.messageContentService.sendMessage(messageToSend);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedImage = file;
      
      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  sendImageMessage() {
    if (!this.selectedImage) return;

    console.log('Uploading image:', this.selectedImage.name);

    // Upload ảnh lên server
    this.messageContentService.uploadImage(this.selectedImage).subscribe({
      next: (imageUrl: string) => {
        console.log('Image uploaded successfully. URL:', imageUrl);
        
        // Trim URL để loại bỏ khoảng trắng
        const cleanUrl = imageUrl.trim();
        
        // Gửi tin nhắn với URL ảnh
        const messageToSend: MessageContent = {
          content: cleanUrl,
          messageRoomId: this.selectedMessageRoom.id,
          sender: this.currentUser.username,
          messageType: MessageType.IMAGE
        };

        console.log('Sending image message:', messageToSend);
        this.messageContentService.sendMessage(messageToSend);
        
        // Reset
        this.selectedImage = null;
        this.imagePreview = null;
        this.messageToSend = {};
      },
      error: (error) => {
        console.error('Failed to upload image:', error);
        
        // Xử lý các loại lỗi khác nhau
        if (error.error?.message) {
          this.fileErrorMessage = error.error.message;
        } else if (error.status === 413) {
          this.fileErrorMessage = 'Kích thước ảnh vượt quá giới hạn cho phép (50MB).\n\nVui lòng chọn ảnh nhỏ hơn.';
        } else if (error.status === 0) {
          this.fileErrorMessage = 'Kích thước ảnh quá lớn hoặc kết nối bị gián đoạn.\n\nVui lòng chọn ảnh nhỏ hơn 50MB.';
        } else {
          this.fileErrorMessage = 'Không thể tải ảnh lên.\n\nVui lòng thử lại sau.';
        }
        
        this.isShowFileErrorDialog = true;
        this.selectedImage = null;
        this.imagePreview = null;
      }
    });
  }

  // ============ FILE UPLOAD ============

  /**
   * Xử lý khi người dùng chọn file
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra định dạng file
    if (!this.messageContentService.isFileAllowed(file.name)) {
      const extension = this.messageContentService.getFileExtension(file.name);
      this.fileErrorMessage = `Định dạng file "${extension}" không được phép.\n\nChỉ cho phép các định dạng: .docx, .pptx, .xlsx, .xls, .pdf, .zip, .rar`;
      this.isShowFileErrorDialog = true;
      // Reset input
      event.target.value = '';
      return;
    }

    // Kiểm tra kích thước file (tối đa 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      this.fileErrorMessage = 'Kích thước file vượt quá 50MB.\n\nVui lòng chọn file nhỏ hơn.';
      this.isShowFileErrorDialog = true;
      event.target.value = '';
      return;
    }

    this.selectedFile = file;
    this.sendFileMessage();
    event.target.value = '';
  }

  /**
   * Gửi file đính kèm
   */
  sendFileMessage() {
    if (!this.selectedFile) return;

    console.log('Uploading file:', this.selectedFile.name);

    this.messageContentService.uploadFile(this.selectedFile).subscribe({
      next: (fileInfo: any) => {
        console.log('File uploaded successfully:', fileInfo);

        // Gửi tin nhắn với thông tin file dạng JSON
        const messageToSend: MessageContent = {
          content: JSON.stringify(fileInfo),
          messageRoomId: this.selectedMessageRoom.id,
          sender: this.currentUser.username,
          messageType: MessageType.FILE
        };

        console.log('Sending file message:', messageToSend);
        this.messageContentService.sendMessage(messageToSend);

        // Reset
        this.selectedFile = null;
      },
      error: (error) => {
        console.error('Failed to upload file:', error);
        
        // Xử lý các loại lỗi khác nhau
        if (error.error?.message) {
          this.fileErrorMessage = error.error.message;
        } else if (error.status === 413 || error.error?.error?.includes('quá lớn')) {
          this.fileErrorMessage = 'Kích thước file vượt quá giới hạn cho phép (50MB).\n\nVui lòng chọn file nhỏ hơn.';
        } else if (error.status === 0) {
          this.fileErrorMessage = 'Kích thước file quá lớn hoặc kết nối bị gián đoạn.\n\nVui lòng chọn file nhỏ hơn 50MB.';
        } else {
          this.fileErrorMessage = 'Không thể tải file lên.\n\nVui lòng thử lại sau.';
        }
        
        this.isShowFileErrorDialog = true;
        this.selectedFile = null;
      }
    });
  }

  // Thêm phương thức clearSpamError để xóa thông báo lỗi spam
  clearSpamError(): void {
    this.isSpamBlocked = false;
    this.spamErrorMessage = '';
    this.isShowSpamDialog = false;
  }

  // ============ CHAT BACKGROUND ============
  
  /**
   * Xử lý khi người dùng chọn ảnh nền từ thiết bị
   */
  onBackgroundSelected(event: any) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      event.target.value = '';
      return;
    }

    if (!this.selectedMessageRoom.id) {
      this.fileErrorMessage = 'Vui lòng chọn một cuộc trò chuyện trước.';
      this.isShowFileErrorDialog = true;
      event.target.value = '';
      return;
    }

    this.isUploadingBackground = true;

    // Upload ảnh lên server
    this.messageContentService.uploadImage(file).subscribe({
      next: (imageUrl: string) => {
        const cleanUrl = imageUrl.trim();
        
        // Cập nhật ảnh nền cho phòng chat
        this.messageRoomService.setBackground(this.selectedMessageRoom.id!, cleanUrl).subscribe({
          next: (room: MessageRoom) => {
            this.selectedMessageRoom.backgroundUrl = room.backgroundUrl;
            // Cập nhật trong danh sách rooms
            const roomIndex = this.messageRooms.findIndex(r => r.id === room.id);
            if (roomIndex !== -1) {
              this.messageRooms[roomIndex].backgroundUrl = room.backgroundUrl;
            }
            this.isUploadingBackground = false;
          },
          error: (error) => {
            console.error('Failed to set background:', error);
            this.fileErrorMessage = 'Không thể đặt ảnh nền. Vui lòng thử lại.';
            this.isShowFileErrorDialog = true;
            this.isUploadingBackground = false;
          }
        });
      },
      error: (error) => {
        console.error('Failed to upload background:', error);
        this.fileErrorMessage = 'Không thể tải ảnh nền lên. Vui lòng thử lại.';
        this.isShowFileErrorDialog = true;
        this.isUploadingBackground = false;
      }
    });

    event.target.value = '';
  }

  /**
   * Xóa ảnh nền cuộc trò chuyện
   */
  removeBackground() {
    if (!this.selectedMessageRoom.id) return;

    this.messageRoomService.setBackground(this.selectedMessageRoom.id, '').subscribe({
      next: (room: MessageRoom) => {
        this.selectedMessageRoom.backgroundUrl = '';
        // Cập nhật trong danh sách rooms
        const roomIndex = this.messageRooms.findIndex(r => r.id === room.id);
        if (roomIndex !== -1) {
          this.messageRooms[roomIndex].backgroundUrl = '';
        }
      },
      error: (error) => {
        console.error('Failed to remove background:', error);
      }
    });
  }

  logout() {
    this.userService.disconnect(this.currentUser);
    this.messageContentService.disconnect();
    this.userService.removeFromLocalStorage();
    this.router.navigate(['/login']);
  }



  updateLastSeen(roomId?: string, username?: string) {
    this.messageRoomMemberService.updateLastSeen(roomId, username).subscribe({
      next: (member: MessageRoomMember) => {
        this.selectedMessageRoom.unseenCount = 0;
      }, error: (error: any) => {
        console.log(error);
      }
    });
  }



  findMessageRoomAtLeastOneContent() {
    
    if(!this.currentUser.username) return;
    this.messageRoomService.findMessageRoomAtLeastOneContent(this.currentUser.username).subscribe({
      next: (rooms: MessageRoom[]) => {
        console.log('rooms', rooms);
        this.messageRooms = rooms;
      }, error: (error) => {
        console.log(error);
      }
    });
  }



  scrollToBottom() {
    setTimeout(() => {
      const chat = document.getElementById('chat-area');
      if(chat) chat.scrollTop = chat.scrollHeight;
    }, 100);
  }



  switchMode(mode: string) {
    this.themeService.switchMode(mode);
  }

  switchColor(color: string) {
    this.themeService.switchColor(color);
  }

  onThemeColorChange(selectedColor: any) {
    console.log('Theme color changed:', selectedColor);
    if (selectedColor && selectedColor.name) {
      this.themeColor = selectedColor;
      this.switchColor(selectedColor.name);
    }
  }



  isShowDialogAddMember: boolean = false;

  addMembers(members: User[]) {
    this.messageRoomMemberService.addMembers(this.selectedMessageRoom.id, members).subscribe({
      next: (members: MessageRoomMember[]) => {
        this.selectedMessageRoom.members?.push(...members);
        this.isShowDialogAddMember = false;
      }, error: (error) => {
        console.log(error);
      }
    });
  }



  isShowEditMember: boolean = false;
  selectedMember: undefined | MessageRoomMember = {};

  makeAdmin() {
    this.messageRoomMemberService.makeAdmin(this.selectedMessageRoom.id, this.selectedMember?.username).subscribe({
      next: (updateMember: MessageRoomMember) => {
        const index = this.selectedMessageRoom.members?.findIndex(m => m.username === updateMember.username);
        if(index !== undefined && index !== -1 && this.selectedMessageRoom.members) {
          this.selectedMessageRoom.members[index].isAdmin = true;
        }
        this.isShowEditMember = false;
        this.selectedMember = undefined;
      }, error: (error) => {
        console.log(error);
      }
    });
  }



  removeAdmin() {
    this.messageRoomMemberService.removeAdmin(this.selectedMessageRoom.id, this.selectedMember?.username).subscribe({
      next: (updateMember: MessageRoomMember) => {
        const index = this.selectedMessageRoom.members?.findIndex(m => m.username === updateMember.username);
        if(index !== undefined && index !== -1 && this.selectedMessageRoom.members) {
          this.selectedMessageRoom.members[index].isAdmin = false;
        }
        this.isShowEditMember = false;
        this.selectedMember = undefined;
      }, error: (error) => {
        console.log(error);
      }
    });
  }



  removeFromGroup() {
    this.messageRoomMemberService.removeMember(this.selectedMessageRoom.id, this.selectedMember?.username).subscribe({
      next: (bool: Boolean) => {
        if(bool) {
          this.selectedMessageRoom.members = this.selectedMessageRoom.members?.filter(m => m.username !== this.selectedMember?.username);
        }
        this.isShowEditMember = false;
        this.selectedMember = undefined;
      }, error: (error) => {
        console.log(error);
      }
    });
  }



  leaveGroup() {
    const member = this.selectedMessageRoom.members?.filter(m => m.username === this.currentUser.username)[0];

    const countAdmin = this.selectedMessageRoom.members?.filter(m => m.isAdmin).length ?? 0;
    if(countAdmin <= 1) {
      alert('Bạn không thể rời nhóm vì hiện tại bạn là trưởng nhóm duy nhất của nhóm');
      return;
    }

    this.messageRoomMemberService.removeMember(this.selectedMessageRoom.id, member?.username).subscribe({
      next: (bool: Boolean) => {
        if(bool) {
          window.location.reload();
        }
      }, error: (error) => {
        console.log(error);
      }
    });
  }


  // Thêm emoji vào tin nhắn
  addEmoji(emoji: string) {
    if (!this.messageToSend.content) {
      this.messageToSend.content = '';
    }
    this.messageToSend.content += emoji;
    this.emojiPanel.hide();
  }


  // Đổi tên nhóm chat
  openRenameDialog() {
    this.newGroupName = this.selectedMessageRoom.name || '';
    this.isShowRenameDialog = true;
  }

  renameGroup() {
    if (!this.newGroupName.trim() || !this.selectedMessageRoom.id) {
      return;
    }

    this.messageRoomService.renameRoom(this.selectedMessageRoom.id, this.newGroupName.trim()).subscribe({
      next: (room: MessageRoom) => {
        this.selectedMessageRoom.name = room.name;
        // Cập nhật trong danh sách rooms
        const roomIndex = this.messageRooms.findIndex(r => r.id === room.id);
        if (roomIndex !== -1) {
          this.messageRooms[roomIndex].name = room.name;
        }
        this.isShowRenameDialog = false;
        this.newGroupName = '';
      },
      error: (error) => {
        console.error('Failed to rename group:', error);
        alert('Không thể đổi tên nhóm. Vui lòng thử lại.');
      }
    });
  }


  // Gửi vị trí GPS
  sendLocation() {
    if (!navigator.geolocation) {
      this.locationErrorMessage = 'Trình duyệt của bạn không hỗ trợ định vị GPS.';
      this.isShowLocationErrorDialog = true;
      return;
    }

    this.isGettingLocation = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const locationContent = `${lat},${lng}`;

        const messageToSend: MessageContent = {
          content: locationContent,
          messageRoomId: this.selectedMessageRoom.id,
          sender: this.currentUser.username,
          messageType: MessageType.LOCATION
        };

        this.messageContentService.sendMessage(messageToSend);
        this.isGettingLocation = false;
      },
      (error) => {
        this.isGettingLocation = false;
        let errorMsg = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Quyền truy cập vị trí đã bị chặn.\n\nĐể sử dụng tính năng này:\n1. Click vào biểu tượng 🔒 bên trái thanh địa chỉ\n2. Tìm mục "Vị trí" và chọn "Cho phép"\n3. Tải lại trang (F5)';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Không thể lấy thông tin vị trí.\n\nVui lòng kiểm tra GPS hoặc kết nối mạng.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Yêu cầu lấy vị trí đã hết thời gian.\n\nVui lòng thử lại.';
            break;
          default:
            errorMsg = 'Có lỗi xảy ra khi lấy vị trí.\n\nVui lòng thử lại sau.';
        }
        this.locationErrorMessage = errorMsg;
        this.isShowLocationErrorDialog = true;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

}
