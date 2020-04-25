import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';

import { environment } from '../../environments/environment';
import { User } from './user.model';

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

  private fireBaseSignUpURL = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=';
  private fireBaseSignInURL = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=';
  private fireBaseResetPasswordURL = 'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=';

  constructor(private readonly http: HttpClient) {

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
          email: string
        };

        const expirationTime = new Date(parsedStoredData.tokenExpirationDate);
        if (expirationTime <= new Date()) {
          return null;
        }
        return new User(
          parsedStoredData.userId,
          parsedStoredData.email,
          parsedStoredData.token,
          expirationTime);
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
    return this.http.post<AuthResponseData>(`${this.fireBaseSignUpURL}${environment.fireBaseAPIKey}`, {
      email,
      password,
      returnSecureToken: true
    }).pipe(
      // not invoking the setUserData method, instead just passing the reference of it and passing the global this reference 
      tap(this.setUserData.bind(this))
    );
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(`${this.fireBaseSignInURL}${environment.fireBaseAPIKey}`, {
      email,
      password,
      returnSecureToken: true
    }).pipe(
      // not invoking the setUserData method, instead just passing the reference of it and passing the global this reference 
      tap(this.setUserData.bind(this))
    );
  }

  private setUserData(userData: AuthResponseData) {
    // convert returned seconds expiresIn time to mili seconds and returns date object;
    const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    );
    this._user.next(user);
    this.autoLogOut(user.tokenDuration);
    this.storeAuthDataToDevice(userData.localId, userData.idToken, expirationTime.toISOString(), userData.email);
  }

  logout() {
    if (this.activeLogOutTimer) {
      clearTimeout(this.activeLogOutTimer);
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

  private storeAuthDataToDevice(
    userId: string,
    token: string,
    tokenExpirationDate: string,
    email: string) {
    const data = JSON.stringify({
      userId,
      token,
      tokenExpirationDate,
      email
    });
    Plugins.Storage.set({
      key: 'authData',
      value: data
    });
  }

  resetPassword(email: string) {
    return this.http.post(`${this.fireBaseResetPasswordURL}${environment.fireBaseAPIKey}`, {
      email,
      requestType : 'PASSWORD_RESET'
    });
  }

  ngOnDestroy() {
    if (this.activeLogOutTimer) {
      clearTimeout(this.activeLogOutTimer);
    }
  }


}
