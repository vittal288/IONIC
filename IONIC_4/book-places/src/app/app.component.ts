import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Platform } from '@ionic/angular';
// these two API are rendering from Cordova , but here we are using CAPACITOR, so commenting below lines and injecting cordova APIs
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Plugins, Capacitor } from '@capacitor/core';
import * as admin from 'firebase-admin';

import { AuthService } from './auth/auth.service';
// import serviceAccount from '../../private/ionic-angular-f34a9.json';
// admin.initializeApp({
//   credential: admin.credential.cert(JSON.stringify(serviceAccount)),
//   databaseURL: 'https://ionic-angular-f34a9.firebaseio.com'
// });

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  content;
  constructor(
    private platform: Platform,
    // these two API are rendering from Cordova , but here we are using CAPACITOR, so commenting below lines and injecting cordova APIs
    // private splashScreen: SplashScreen,
    // private statusBar: StatusBar,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // these two API are rendering from Cordova , but here we are using CAPACITOR, so commenting below lines and injecting cordova APIs
      // this.statusBar.styleDefault();
      // this.splashScreen.hide();
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide();
      }
    });
  }


  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }
}

