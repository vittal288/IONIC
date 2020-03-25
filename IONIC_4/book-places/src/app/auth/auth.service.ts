import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isUserAuthenticated = true;
  private _userid = 'abc';
  constructor() {

  }
  get userIsAuthenticated() {
    return this._isUserAuthenticated;
  }
  get userId() {
    return this._userid;
  }
  login() {
    this._isUserAuthenticated = true;
  }

  logout() {
    this._isUserAuthenticated = false;
  }
}
