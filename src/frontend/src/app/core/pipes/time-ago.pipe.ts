import { DatePipe } from '@angular/common';
import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo'
})
@Injectable({
  providedIn: 'root'
})
export class TimeAgoPipe implements PipeTransform {

  constructor(
    private datePipe: DatePipe
  ) {}

 
  transform(value: any, type?: 'h'| 'd' | 'w' | 'mth' | 'y'): string | null {
    // Nếu không truyền type, mặc định dùng 'w' (week)
    if (value) {
      if(!type) type = 'w';
     // Tính tổng số giây từ thời điểm hiện tại đến thời điểm truyền vào
      const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);

      // Nếu chưa tới 1 phút → trả về "Just now"
      if (seconds < 60)
        return 'Mới đây';

      // Định nghĩa số giây trong từng đơn vị thời gian
      const intervals: { [key: string]: number } = {
        'y': 31536000,
        'mth': 2592000,
        'w': 604800,
        'd': 86400,
        'h': 3600,
        'm': 60,
        's': 1
      };

      let counter;
     // Duyệt qua từng đơn vị thời gian từ lớn → nhỏ
      for (const i in intervals) {
        // Tính xem có bao nhiêu đơn vị thời gian tương ứng
        counter = Math.floor(seconds / intervals[i]);

         // Nếu lớn hơn 0 thì tìm được đơn vị phù hợp
        
        if (counter > 0) {
          /**
           * Nếu:
           *   counter = 1 
           *    HOẶC
           *   đơn vị i khác đơn vị giới hạn `type`
           *    HOẶC
           *   tổng số giây nhỏ hơn đơn vị giới hạn `type`
           *
           *   Trả về dạng rút gọn: "3h", "5d", "2w"
           */
          
          if ((counter === 1 || i !== type) && seconds < intervals[type]) {
            return counter + i; // 1h, 1d, 3m, 6y
          } 
          else {
             // Nếu đã vượt quá giới hạn trả về dạng full date
            
            return this.datePipe.transform(value, 'HH:mm:ss dd/MM/yyyy'); 
          }
        }
      }
    }
     // Trường hợp dữ liệu không hợp lệ trả nguyên giá trị
    return value;
  }

}
