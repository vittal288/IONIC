import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { AuthService, AuthResponseData } from './auth.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = false;
  constructor(private authService: AuthService,
              private router: Router,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController) {

  }

  ngOnInit() {
  }

  authenticate(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Logging In...'
    }).then((loadingEl) => {
      loadingEl.present();
      let authObs: Observable<AuthResponseData>;
      if (this.isLogin) {
        authObs = this.authService.login(email, password);
      } else {
        authObs = this.authService.signUp(email, password);
      }
      authObs.subscribe(respData => {
        this.isLoading = false;
        loadingEl.dismiss();
        this.router.navigateByUrl('/places/tabs/discover');
      }, errorResp => {
        console.log('Sign Up Error', errorResp);
        loadingEl.dismiss();
        const code = errorResp.error.error.message;
        let message = 'Could not able to sign up, please try again later';
        if (code === 'EMAIL_EXISTS') {// Email already exist
          message = 'This email address exists already';
        } else if (code === 'EMAIL_NOT_FOUND') {
          message = 'This email is not registered';
        } else if (code === 'INVALID_PASSWORD') {
          message = 'This password in not correct';
        } else if (code === 'USER_DISABLED') {
          message = 'The user account has been disabled by an administrator.';
        }
        this.showAlert(message);
      });
    });
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.authenticate(email, password);
    form.reset();
  }

  showAlert(message: string) {
    this.alertCtrl.create({
      header: 'Authentication Failed',
      message,
      buttons: [
        {
          text: 'Okay'
        }
      ]
    }).then(alertEl => {
      alertEl.present();
    });
  }

  onForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }

}
