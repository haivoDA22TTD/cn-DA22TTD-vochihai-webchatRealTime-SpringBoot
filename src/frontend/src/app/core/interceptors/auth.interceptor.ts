import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * HTTP Interceptor để tự động gắn JWT token vào mỗi request
 * 
 * Interceptor là middleware trong Angular HTTP Client, cho phép:
 * - Thêm/sửa headers trước khi gửi request
 * - Xử lý response/error tập trung
 * 
 * Luồng hoạt động:
 * 1. Component gọi HttpClient.get/post/...
 * 2. Request đi qua Interceptor
 * 3. Interceptor thêm header Authorization
 * 4. Request được gửi đến server
 * 5. Response trả về qua Interceptor
 * 6. Interceptor kiểm tra lỗi 401
 * 7. Response trả về Component
 * 
 * Đăng ký trong app.module.ts:
 * providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }]
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  /**
   * Xử lý mỗi HTTP request
   * @param request - Request gốc từ HttpClient
   * @param next - Handler để chuyển request đến interceptor tiếp theo hoặc server
   * @returns Observable của HttpEvent
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 1. Lấy JWT token từ localStorage
    // Token được lưu khi đăng nhập thành công
    const token = localStorage.getItem('token');
    
    // 2. Nếu có token → clone request và thêm header Authorization
    // Request trong Angular là immutable, phải clone để sửa đổi
    if (token) {
      request = request.clone({
        setHeaders: {
          // Format chuẩn: "Bearer <token>"
          // Server sẽ đọc header này để xác thực
          Authorization: `Bearer ${token}`
        }
      });
    }

    // 3. Chuyển request đến handler tiếp theo và xử lý response
    return next.handle(request).pipe(
      // 4. Bắt lỗi từ response
      catchError((error: HttpErrorResponse) => {
        // 5. Nếu lỗi 401 (Unauthorized) → token hết hạn hoặc không hợp lệ
        if (error.status === 401) {
          // Xóa thông tin đăng nhập
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Chuyển về trang login
          this.router.navigate(['/login']);
        }
        // 6. Ném lỗi để component xử lý tiếp
        return throwError(() => error);
      })
    );
  }
}
