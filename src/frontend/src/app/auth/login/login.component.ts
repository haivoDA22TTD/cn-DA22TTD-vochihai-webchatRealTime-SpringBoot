import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/core/interfaces/user';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // Đối tượng user dùng để binding với form
  user: User = {
    username: '',
    password: ''
  }

  constructor(
    private userService: UserService, // Service xử lý API người dùng
    private router: Router,           // Điều hướng trang sau khi login
  ) {}

  // Hàm đăng nhập
  login() {
    // Kiểm tra nếu trống thì không làm gì
    if(!this.user.username || !this.user.password) return;
    // Loại bỏ khoảng trắng dư thừa
    this.user.username = this.user.username.trim();
    this.user.password = this.user.password.trim();
    // Gọi API login từ UserService
    this.userService.login(this.user).subscribe({
      // Nếu API trả về thành công
      next: (response: User) => {
        console.log(response);
        // Lưu thông tin user/token vào localStorage
        this.userService.saveToLocalStorage(response);
        this.router.navigate(['/']);
      }, 
      // Điều hướng về trang chủ
      error: (error: any) => {
        console.log(error);
      }
    });
  }

}
