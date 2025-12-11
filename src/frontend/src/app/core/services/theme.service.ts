import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service quản lý theme (giao diện) của ứng dụng
 * 
 * Chức năng:
 * 1. Chuyển đổi Dark/Light mode
 * 2. Thay đổi màu chủ đề (color scheme)
 * 3. Lưu preference vào localStorage
 * 4. Notify components khi theme thay đổi (Observable pattern)
 * 
 * Cách hoạt động:
 * - PrimeNG themes được load từ assets/themes/
 * - Khi đổi theme, thay đổi href của thẻ <link id="app-theme">
 * - Màu tin nhắn được set qua CSS variable --message-bubble-color
 */
@Injectable({
  providedIn: 'root'  // Singleton service, available toàn app
})
export class ThemeService {

  // Chế độ hiện tại: 'light' hoặc 'dark'
  private _themeMode: string = 'light';
  
  // Màu chủ đề hiện tại
  private _themeColor: string = 'pink';
  
  // BehaviorSubject: Loại Subject đặc biệt, lưu giá trị cuối cùng
  // Khi component subscribe, sẽ nhận ngay giá trị hiện tại
  private themeModeSubject = new BehaviorSubject<string>(this._themeMode);
  private themeColorSubject = new BehaviorSubject<string>(this._themeColor);
  
  // Observable để components subscribe và nhận thông báo khi theme thay đổi
  public themeMode$ = this.themeModeSubject.asObservable();
  public themeColor$ = this.themeColorSubject.asObservable();

  // Getter để lấy giá trị hiện tại
  get themeMode(): string {
    return this._themeMode
  }
  get themeColor(): string {
    return this._themeColor
  }

  // Danh sách các màu có sẵn với mã hex
  private _themeColors = [
    {
      name: 'blue',
      color: '#3B82F6'
    },
    {
      name: 'green',
      color: '#10b981'
    },
    {
      name: 'purple',
      color: '#8B5CF6'
    },
    {
      name: 'cyan',
      color: '#06b6d4'
    },
    {
      name: 'indigo',
      color: '#6366F1'
    },
    {
      name: 'amber',
      color: '#f59e0b'
    },
    {
      name: 'teal',
      color: '#14b8a6'
    },
    {
      name: 'pink',
      color: '#ec4899'
    },
    {
      name: 'noir',
      color: '#020617'
    },
    {
      name: 'lime',
      color: '#84cc16'
    }
  ];

  get themeColors(): any {
    return this._themeColors;
  }

  /**
   * Constructor - khởi tạo service
   * Đọc theme preference từ localStorage và áp dụng
   */
  constructor() {
    // Đọc preference từ localStorage, mặc định dark mode + blue
    this._themeMode = localStorage.getItem('theme.mode') ?? 'dark';
    this._themeColor = localStorage.getItem('theme.color') ?? 'blue';
    
    // Phát giá trị ban đầu cho subscribers
    this.themeModeSubject.next(this._themeMode);
    this.themeColorSubject.next(this._themeColor);
    
    // Áp dụng theme
    this.applyPrimeNGTheme(); // Load PrimeNG theme CSS
    this.applyTheme();        // Set màu tin nhắn
  }

  /**
   * Tìm object màu theo tên
   * @param name - Tên màu (blue, green, purple, etc.)
   * @returns Object chứa name và color hex
   */
  getGetThemeColorObject(name: string) {
    return this.themeColors.find((t: any) => t.name === name);
  }

  /**
   * Chuyển đổi chế độ sáng/tối
   * @param mode - 'light' hoặc 'dark'
   */
  switchMode(mode: string) {
    this._themeMode = mode;
    localStorage.setItem('theme.mode', mode);  // Lưu vào localStorage
    this.themeModeSubject.next(mode);          // Notify subscribers
    this.applyPrimeNGTheme();                  // Đổi PrimeNG theme
  }

  /**
   * Thay đổi màu chủ đề
   * @param color - Tên màu (blue, green, purple, etc.)
   */
  switchColor(color: string) {
    this._themeColor = color;
    localStorage.setItem('theme.color', color);
    this.themeColorSubject.next(color);
    this.applyTheme();
  }

  /**
   * Áp dụng màu cho tin nhắn
   * Sử dụng CSS Custom Property (CSS Variable)
   * 
   * CSS Variable cho phép thay đổi màu động mà không cần reload CSS
   * Định nghĩa: --message-bubble-color
   * Sử dụng trong CSS: background-color: var(--message-bubble-color)
   */
  applyTheme() {
    const colorObj = this.getGetThemeColorObject(this._themeColor);
    if (colorObj) {
      // Set CSS variable trên :root (document.documentElement)
      document.documentElement.style.setProperty('--message-bubble-color', colorObj.color);
      console.log('Message bubble color changed to:', colorObj.color);
    }
  }

  /**
   * Áp dụng PrimeNG theme
   * 
   * PrimeNG themes là các file CSS riêng biệt
   * Đổi theme bằng cách thay đổi href của thẻ <link>
   * 
   * Cấu trúc tên theme: lara-{mode}-{color}
   * Ví dụ: lara-light-blue, lara-dark-blue
   */
  applyPrimeNGTheme() {
    // Tìm thẻ <link id="app-theme"> trong index.html
    const themeLink = document.getElementById('app-theme') as HTMLLinkElement;
    if (themeLink) {
      // Tạo tên theme mới
      const themeName = `lara-${this._themeMode}-blue`;
      const newHref = `assets/themes/${themeName}/theme.css`;
      
      // Đổi href → browser tự động load CSS mới
      themeLink.href = newHref;
      console.log('PrimeNG theme changed to:', themeName);
    }
  }

}
