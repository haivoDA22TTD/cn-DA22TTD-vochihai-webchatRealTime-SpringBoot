import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MessageContent } from 'src/app/core/interfaces/message-content';
import { User } from 'src/app/core/interfaces/user';

@Component({
  selector: 'app-message-content',
  templateUrl: './message-content.component.html',
  styleUrls: ['./message-content.component.scss']
})
export class MessageContentComponent {

  @Input() messageContent?: MessageContent;
  @Input() currentUser?: User;

  constructor(private sanitizer: DomSanitizer) {}

  onImageError(event: any) {
    console.error('Failed to load image:', this.messageContent?.content);
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
  }

  // Lấy tọa độ từ content
  getLocationCoords(): string {
    if (!this.messageContent?.content) return '';
    const [lat, lng] = this.messageContent.content.split(',');
    return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
  }

  // Tạo URL cho Google Maps embed
  getMapUrl(): SafeResourceUrl | null {
    if (!this.messageContent?.content) return null;
    const [lat, lng] = this.messageContent.content.split(',');
    const url = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2s!4v1234567890`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Mở vị trí trong Google Maps
  openLocationInMaps() {
    if (!this.messageContent?.content) return;
    const [lat, lng] = this.messageContent.content.split(',');
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  }

}
