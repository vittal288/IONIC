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
  public signedWithOAuth: boolean;
  private googleAuthResponse: any;
  private facebookOAuthResponse: any;


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
    if (this.signedWithOAuth) {
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
      if (this.signedWithOAuth) {
         this.signedWithOAuth = false;
         this.googleAuthResponse = null;
         this.facebookOAuthResponse = null;
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
        this.signedWithOAuth = true;
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
      tap(this.handleOAuthResponse.bind(this))
    );
  }

  loginWithFaceBook() {
    const provider = new firebase.auth.FacebookAuthProvider();
    return from(firebase.auth().signInWithPopup(provider)).pipe(
      switchMap((faceBookResp: any) => {
        this.signedWithOAuth = true;
        this.facebookOAuthResponse = faceBookResp;
        const payload = {
          requestUri: environment.googleProjectInfo.redirectURI,
          postBody: `access_token=${faceBookResp.credential.accessToken}&providerId=${faceBookResp.credential.providerId}`,
          returnSecureToken: true,
          returnIdpCredential: true
        };
        return this.linkOAuthCredentialToFirebaseDB(payload);
      }),
       // not invoking the handleLoginWithOAuth method, instead just passing the reference of it and passing the global this reference 
      tap(this.handleOAuthResponse.bind(this))
    );
  }

  handleOAuthResponse(fireBaseResp: any) {
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
      userAdditionInfo.emailVerified = fireBaseResp.emailVerified;
      userAdditionInfo.firstName = this.googleAuthResponse.additionalUserInfo.profile.given_name;
      userAdditionInfo.lastName = this.googleAuthResponse.additionalUserInfo.profile.family_name;
      userAdditionInfo.profilePicURL = this.googleAuthResponse.additionalUserInfo.profile.picture;
    }

    if (this.facebookOAuthResponse && this.facebookOAuthResponse.additionalUserInfo) {
      userAdditionInfo.displayName = this.facebookOAuthResponse.additionalUserInfo.profile.name;
      userAdditionInfo.emailVerified = fireBaseResp.emailVerified;
      userAdditionInfo.firstName = this.facebookOAuthResponse.additionalUserInfo.profile.first_name;
      userAdditionInfo.lastName = this.facebookOAuthResponse.additionalUserInfo.profile.last_name;
      userAdditionInfo.profilePicURL = this.facebookOAuthResponse.additionalUserInfo.profile.picture.data.url;
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
