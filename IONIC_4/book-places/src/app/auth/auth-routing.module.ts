import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthPage } from './auth.page';
import { ForgotPasswordPage } from './forgot-password/forgot-password.page';

const routes: Routes = [
    { path: '', component: AuthPage },
    { path: 'forgot-password', component: ForgotPasswordPage }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class AuthRoutingModule {

}