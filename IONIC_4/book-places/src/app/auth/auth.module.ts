import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AuthPage } from './auth.page';
import { AuthRoutingModule } from './auth-routing.module';
import { ForgotPasswordPage } from './forgot-password/forgot-password.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuthRoutingModule
  ],
  declarations: [AuthPage, ForgotPasswordPage]
})
export class AuthPageModule {}
