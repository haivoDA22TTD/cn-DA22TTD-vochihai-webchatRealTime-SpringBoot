import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from 'src/app/core/interfaces/user';

@Component({
  selector: 'app-select-users-dialog',
  templateUrl: './select-users-dialog.component.html',
  styleUrls: ['./select-users-dialog.component.scss']
})
export class SelectUsersDialogComponent {
  @Input () visible:boolean = false;
  @Input() btnAction: string = 'Xác nhận';    // nút bấm
  @Input() currentUsername: string = ''; 
  @Output () onHideEvent = new EventEmitter();
  @Output () onSubmitEvent = new EventEmitter();
  
  selectedUsers: User[] = [];
  searchedUsers: User[] = [];
  onSearch(event: any){
    console.log(event);
  }
  onHide(){
    this.onHideEvent.emit();
  }

  onSubmit(){
    this.onSubmitEvent.emit(this.selectedUsers);
    this.selectedUsers = [];
  }
}
