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

 // Thêm thuộc tính để hiển thị thông báo spam cụ thể
  isSpamBlocked: boolean = false;
  spamErrorMessage: string = '';

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
        
        // Tự động ẩn thông báo sau 5 giây
        setTimeout(() => {
          this.clearSpamError();
        }, 5000);
      },
      error: (error: any) => {
        console.error('Error subscribing to errors:', error);
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

    const messageToSend: MessageContent = {
      content: this.messageToSend.content.trim(),
      messageRoomId: this.selectedMessageRoom.id,
      sender: this.currentUser.username,
      messageType: MessageType.TEXT
    };

    // Gửi tin nhắn
    this.messageContentService.sendMessage(messageToSend);
    
    // Reset các giá trị sau khi gửi
    this.messageToSend = {};
    this.isSpamBlocked = false;
    this.spamErrorMessage = '';
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
        alert('Không thể tải ảnh lên. Vui lòng thử lại.');
      }
    });
  }

  // Thêm phương thức clearSpamError để xóa thông báo lỗi spam
  clearSpamError(): void {
    this.isSpamBlocked = false;
    this.spamErrorMessage = '';
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
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS');
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
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Bạn đã từ chối quyền truy cập vị trí');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('Không thể lấy thông tin vị trí');
            break;
          case error.TIMEOUT:
            alert('Yêu cầu lấy vị trí đã hết thời gian');
            break;
          default:
            alert('Có lỗi xảy ra khi lấy vị trí');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

}
