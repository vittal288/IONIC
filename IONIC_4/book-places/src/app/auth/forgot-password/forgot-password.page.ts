import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  constructor(private readonly router: Router,
    private readonly authService: AuthService,
    private readonly alertCtr: AlertController) { }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    this.authService.resetPassword(email).subscribe(response => {
      console.log('RESP', response);
      form.reset();
      this.showAlert('SUCCESS',
        'Password reset email, has been sent to your registered email id, please use the link to reset your password');
    }, err => {
      console.log('ERROR', err);
      form.reset();
      if (err.error.error) {
        this.showAlert('NO EMAIL', err.error.error.message);
      } else {
        this.showAlert('ERROR', 'Something went wrong, please try again later');
      }
    });
  }

  onBackLogin() {
    this.router.navigate(['/auth']);
  }

  showAlert(header: string, message: string) {
    this.alertCtr.create({
      header,
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

}
