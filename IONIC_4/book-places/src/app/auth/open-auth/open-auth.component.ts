import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { HelperService } from '../../services/helper.service';


@Component({
  selector: 'app-open-auth',
  templateUrl: './open-auth.component.html',
  styleUrls: ['./open-auth.component.scss'],
})
export class OpenAuthComponent implements OnInit {

  constructor(private readonly authService: AuthService, 
              private readonly router: Router,
              private readonly helperService: HelperService,
              private readonly loadingCtrl: LoadingController) { }

  ngOnInit() { }

  signInWithGoogle() {
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Logging In...'
    }).then(loadingEl => {
      loadingEl.present();
      this.authService.loginWithGoogle().subscribe(resp => {
        this.router.navigateByUrl('/places/tabs/discover');
        loadingEl.dismiss();
      }, error => {
        loadingEl.dismiss();
        console.log('Google Sign In Error-->', error);
        this.helperService.showAlert('Error', 'Something went wrong, please try again');
      });
    });
  }

  signInWithFaceBook() {
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Logging In...'
    }).then(loadingEl => {
      loadingEl.present();
      this.authService.loginWithFaceBook().subscribe(resp => {
        this.router.navigateByUrl('/places/tabs/discover');
        loadingEl.dismiss();
      }, errorResp => {
        loadingEl.dismiss();
        console.log('Facebook Sign In Error-->', errorResp);
        this.helperService.showAlert('Error', 'Something went wrong, please try again');
      });
    });
  }

}
