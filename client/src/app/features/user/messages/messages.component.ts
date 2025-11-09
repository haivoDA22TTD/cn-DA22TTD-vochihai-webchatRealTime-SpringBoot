import { Component } from '@angular/core';
import { User } from 'src/app/core/interfaces/user';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent {
  currentUser: User = {};
  activeUsersSubscription: any;

  constructor(  
    private userService: UserService
  ) {}
  
  ngOnInit(){
    this.currentUser = this.userService.getFromLocalStorage();
    this.userService.connect(this.currentUser);
    this.activeUsersSubscription = this.userService.subscribeActiveUsers().subscribe({
      next: (user: User) =>{
          console.log(user)
      },
      error(err){
        console.log(err);
      },
    });
  }

}
