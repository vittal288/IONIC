import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Plugins, Capacitor, AppState } from '@capacitor/core';
import * as firebase from 'firebase';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { AuthService } from './auth/auth.service';
import { environment} from '../environments/environment';
import { User } from './auth/user.model';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  private previousAuthState = false;
  userInfo:User;
  content;
  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    // init firebase app
    firebase.initializeApp({
      apiKey: environment.firebaseProjectInfo.fireBaseAPIKey,
      authDomain: environment.firebaseProjectInfo.authDomain,
      databaseURL: environment.firebaseProjectInfo.databaseURL,
      projectId: environment.firebaseProjectInfo.projectId,
      storageBucket: environment.firebaseProjectInfo.storageBucket,
      messagingSenderId: environment.firebaseProjectInfo.messagingSenderId
    });

    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide();
      }
    });
  }


  onLogout() {
    this.authService.logout();
  }

  ngOnInit() {
    // whenever user is changed then redirect to login page
    this.authSub = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if (!isAuth && this.previousAuthState !== isAuth) {
        this.router.navigateByUrl('/auth');
      } else {
        this.previousAuthState = isAuth;
        this.authService.userInfo.subscribe(userInfo => {
          this.userInfo = userInfo;
        });
      }
    });

    Plugins.App.addListener('appStateChange', this.checkAuthOnResume);
  }

  private checkAuthOnResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe(success => {
          if (!success) {
            this.onLogout();
          }
        });
    }
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}

