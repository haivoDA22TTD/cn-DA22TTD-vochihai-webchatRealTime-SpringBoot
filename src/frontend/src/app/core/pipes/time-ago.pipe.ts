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
    if (value) {
      if(!type) type = 'w';
     
      const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);

      
      if (seconds < 60)
        return 'Just now';

      
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
     
      for (const i in intervals) {
        
        counter = Math.floor(seconds / intervals[i]);

        
        if (counter > 0) {
          
          if ((counter === 1 || i !== type) && seconds < intervals[type]) {
            return counter + i; // 1h, 1d, 3m, 6y
          } 
          else {
            
            return this.datePipe.transform(value, 'HH:mm:ss dd/MM/yyyy'); 
          }
        }
      }
    }
    
    return value;
  }

}
