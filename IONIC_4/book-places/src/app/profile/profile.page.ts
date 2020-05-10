import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  profileInfo: any;
  constructor(private readonly authService: AuthService) { }

  ngOnInit() {
    this.profileInfo = null;
    this.authService.userInfo.subscribe(userInfo => {
      this.profileInfo = userInfo;
    });
  }

}
