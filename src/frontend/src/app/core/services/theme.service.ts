import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private _themeMode: string = 'light';
  private _themeColor: string = 'pink';
  
  // BehaviorSubject để notify components khi theme thay đổi
  private themeModeSubject = new BehaviorSubject<string>(this._themeMode);
  private themeColorSubject = new BehaviorSubject<string>(this._themeColor);
  
  public themeMode$ = this.themeModeSubject.asObservable();
  public themeColor$ = this.themeColorSubject.asObservable();

  get themeMode(): string {
    return this._themeMode
  }
  get themeColor(): string {
    return this._themeColor
  }

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

  constructor() {
    this._themeMode = localStorage.getItem('theme.mode') ?? 'light';
    this._themeColor = localStorage.getItem('theme.color') ?? 'blue';
    this.themeModeSubject.next(this._themeMode);
    this.themeColorSubject.next(this._themeColor);
    this.applyTheme();
  }

  

  getGetThemeColorObject(name: string) {
    return this.themeColors.find((t: any) => t.name === name);
  }



  switchMode(mode: string) {
    this._themeMode = mode;
    localStorage.setItem('theme.mode', mode);
    this.themeModeSubject.next(mode);
    // Mode chỉ ảnh hưởng đến app theme, không cần applyTheme
  }

  switchColor(color: string) {
    this._themeColor = color;
    localStorage.setItem('theme.color', color);
    this.themeColorSubject.next(color);
    this.applyTheme();
  }



  applyTheme() {
    // Chỉ đổi màu CSS variable cho ô tin nhắn, không đổi toàn bộ theme
    const colorObj = this.getGetThemeColorObject(this._themeColor);
    if (colorObj) {
      document.documentElement.style.setProperty('--message-bubble-color', colorObj.color);
      console.log('Message bubble color changed to:', colorObj.color);
    }
  }

}
