import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';
import * as firebase from 'firebase';

import { environment } from '../../environments/environment';
import { User } from './user.model';
import { HelperService } from '../services/helper.service';
import { UserAdditionalInfo } from './user-addotional-info.model';


export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private _user = new BehaviorSubject<User>(null);
  private activeLogOutTimer: any;
  public signedWithOAuthGoogle: boolean;
  public googleAuthResponse: any;

  private fireBaseSignUpURL = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=';
  private fireBaseSignInURL = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=';
  private fireBaseResetPasswordURL = 'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=';
  private linkWithOAuthCredentialURL = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=';

  constructor(private readonly http: HttpClient,
              private readonly helperService: HelperService) {

  }

  get userIsAuthenticated() {
    // !! will covert sting to boolean
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      }));
  }

  get userId() {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.id;
        } else {
          return null;
        }
      }));
  }

  get token() {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.token;
        } else {
          return null;
        }
      }));
  }

  get userInfo() {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return user;
        } else {
          return null;
        }
      })
    );
  }

  autoLogin() {
    // Plugins.Storage.get method returns promise then convert to observable using from rxjs method 
    return from(Plugins.Storage.get({ key: 'authData' })).pipe(
      map(storedData => {
        if (!storedData || !storedData.value) {
          return null;
        }
        const parsedStoredData = JSON.parse(storedData.value) as {
          token: string;
          tokenExpirationDate: string,
          userId: string,
          email: string,
          userAdditionalInfo: UserAdditionalInfo
        };

        const expirationTime = new Date(parsedStoredData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }
        return new User(
          parsedStoredData.userId,
          parsedStoredData.email,
          parsedStoredData.token,
          expirationTime,
          parsedStoredData.userAdditionalInfo);
      }),
      tap(user => {
        if (!user) {
          return;
        }
        this._user.next(user);
        this.autoLogOut(user.tokenDuration);
      }),
      map(user => {
        // !! convert string to boolean
        return !!user;
      })
    );
  }

  signUp(email: string, password: string) {
    return this.http.post<AuthResponseData>(`${this.fireBaseSignUpURL}${environment.firebaseProjectInfo.fireBaseAPIKey}`, {
      email,
      password,
      returnSecureToken: true
    }).pipe(
      // not invoking the setUserData method, instead just passing the reference of it and passing the global this reference 
      tap(this.setUserData.bind(this))
    );
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(`${this.fireBaseSignInURL}${environment.firebaseProjectInfo.fireBaseAPIKey}`, {
      email,
      password,
      returnSecureToken: true
    }).pipe(
      // not invoking the setUserData method, instead just passing the reference of it and passing the global this reference 
      tap(this.setUserData.bind(this))
    );
  }

  private setUserData(userData: AuthResponseData, userAdditionalInfo?: UserAdditionalInfo) {
    // convert returned seconds expiresIn time to milliseconds and returns date object;
    const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime,
      userAdditionalInfo
    );
    this._user.next(user);
    this.autoLogOut(user.tokenDuration);
    this.storeAuthDataToDevice(userData.localId, userData.idToken, expirationTime.toISOString(), userData.email, userAdditionalInfo);
  }

  logout() {
    if (this.activeLogOutTimer) {
      clearTimeout(this.activeLogOutTimer);
    }
    if (this.signedWithOAuthGoogle) {
      this.logoutFromOAuth();
    }
    Plugins.Storage.remove({ key: 'authData' }).then(() => {
      this._user.next(null);
    });
  }

  autoLogOut(duration: number) {
    if (this.activeLogOutTimer) {
      clearTimeout(this.activeLogOutTimer);
    }
    this.activeLogOutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  private logoutFromOAuth() {
    firebase.auth().signOut().then(() => {
      if (this.signedWithOAuthGoogle) {
         this.signedWithOAuthGoogle = false;
      }
    }).catch((error) => {
      // An error happened.
    });

  }

  private storeAuthDataToDevice(
    userId: string,
    token: string,
    tokenExpirationDate: string,
    email: string,
    userAdditionalInfo: any) {
    const data = JSON.stringify({
      userId,
      token,
      tokenExpirationDate,
      email,
      userAdditionalInfo
    });
    Plugins.Storage.set({
      key: 'authData',
      value: data
    });
  }

  resetPassword(email: string) {
    return this.http.post(`${this.fireBaseResetPasswordURL}${environment.firebaseProjectInfo.fireBaseAPIKey}`, {
      email,
      requestType: 'PASSWORD_RESET'
    });
  }

  // open authentication 
  loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return from(firebase.auth().signInWithPopup(provider)).pipe(
      switchMap((googleResp: any) => {
        this.googleAuthResponse = googleResp;
        const payload = {
          requestUri: environment.googleProjectInfo.redirectURI,
          postBody: `id_token=${googleResp.credential.idToken}&providerId=${googleResp.credential.providerId}`,
          returnSecureToken: true,
          returnIdpCredential: true
        };
        return this.linkOAuthCredentialToFirebaseDB(payload);
      }),
       // not invoking the handleLoginWithOAuth method, instead just passing the reference of it and passing the global this reference 
      tap(this.handleLoginWithOAuth.bind(this))
    );
  }
  loginWithFaceBook() {
    // const FACEBOOK_ACCESS_TOKEN = 'f286ac9e847744fb5127200a68f8717f';
    // const FIREBASE_ID_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg4ODQ4YjVhZmYyZDUyMDEzMzFhNTQ3ZDE5MDZlNWFhZGY2NTEzYzgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vaW9uaWMtYW5ndWxhci1mMzRhOSIsImF1ZCI6ImlvbmljLWFuZ3VsYXItZjM0YTkiLCJhdXRoX3RpbWUiOjE1ODgzMzY3NTYsInVzZXJfaWQiOiI5R29WY2dIcW0yZDNYU3loelRDYXU0akdTamwxIiwic3ViIjoiOUdvVmNnSHFtMmQzWFN5aHpUQ2F1NGpHU2psMSIsImlhdCI6MTU4ODMzNjc1NiwiZXhwIjoxNTg4MzQwMzU2LCJlbWFpbCI6InZpdHRhbDI4OEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJ2aXR0YWwyODhAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.m545r0d3D6RNQTsWBkZCirh5J9XfDZnE0eoifbU2jK-dSqPX8o6MzKAp4jJygeKizZyITnYWZzRLbL4nBLls0htmZVPGlI28RO8o1EBGUY9dCjJDZq6cBKigPRUEXmqKiWfrzPkmsMHN8VNy660M-3RYvJYMYmYeV86LRteboMwYYnqkXI7efw5HO2-cqy6DuyB51UIX8U8-aZwytUCtFeYtToIAhoKwRDvos8rw8CsDPa9y_TW5NSg-BxABpYhnv0nNgJmD-OW6evemRkPIxHj90P45yKlLT-9BF0E0EAKw5uch_Gr6u6I6Z4HMs5XlqnMqIUTHM8qdQMankVnNgA';
    // // const key = environment.fireBaseAPIKey;
    // const payload = {
    //   postBody: `access_token=${FACEBOOK_ACCESS_TOKEN}&providerId=facebook.com`,
    //   idToken: FIREBASE_ID_TOKEN,
    //   requestUri: 'http://localhost',
    //   returnIdpCredential: true,
    //   returnSecureToken: true
    // };
    // return this.http.post(`${this.fireBaseOpenAuthURL}${environment.fireBaseAPIKey}`, payload);
  }

  handleLoginWithOAuth(fireBaseResp: any) {
    const userData: any = {};
    if (fireBaseResp) {
      userData.email = fireBaseResp.email;
      userData.expiresIn = fireBaseResp.expiresIn;
      userData.idToken = fireBaseResp.idToken;
      userData.localId = fireBaseResp.localId;
      userData.kind = fireBaseResp.kind;
      userData.refreshToken = fireBaseResp.refreshToken;
    }
    const userAdditionInfo: any = {};
    if (this.googleAuthResponse && this.googleAuthResponse.additionalUserInfo) {
      userAdditionInfo.displayName = this.googleAuthResponse.additionalUserInfo.profile.name;
      userAdditionInfo.emailVerified = this.googleAuthResponse.additionalUserInfo.profile.verified_email;
      userAdditionInfo.firstName = this.googleAuthResponse.additionalUserInfo.profile.given_name;
      userAdditionInfo.lastName = this.googleAuthResponse.additionalUserInfo.profile.family_name;
      userAdditionInfo.profilePicURL = this.googleAuthResponse.additionalUserInfo.profile.picture;
    }

    // updated user data to device
    this.setUserData(userData, userAdditionInfo);
  }

  // once OAuth success, persist the OAuth credentials to firebase DB
  linkOAuthCredentialToFirebaseDB(oAuthCredential: any) {
    return this.http.post(`${this.linkWithOAuthCredentialURL}${environment.firebaseProjectInfo.fireBaseAPIKey}` , oAuthCredential);
  }

  ngOnDestroy() {
    if (this.activeLogOutTimer) {
      clearTimeout(this.activeLogOutTimer);
    }
  }
}
