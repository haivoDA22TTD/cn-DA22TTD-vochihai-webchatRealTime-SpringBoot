import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginResponse, User } from 'src/app/core/interfaces/user';
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

  // Hiển thị dialog lỗi
  showErrorDialog: boolean = false;
  errorMessage: string = '';

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
      // Nếu API trả về
      next: (response: LoginResponse) => {
        console.log(response);
        if (response.success) {
          // Đăng nhập thành công - lưu thông tin và chuyển trang
          this.userService.saveToLocalStorage(response);
          this.router.navigate(['/']);
        } else {
          // Đăng nhập thất bại - hiển thị dialog lỗi
          this.errorMessage = response.message || 'Đăng nhập thất bại';
          this.showErrorDialog = true;
        }
      }, 
      // Lỗi kết nối
      error: (error: any) => {
        console.log(error);
        this.errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.';
        this.showErrorDialog = true;
      }
    });
  }

  // Đóng dialog lỗi
  closeErrorDialog() {
    this.showErrorDialog = false;
    this.errorMessage = '';
  }
}
