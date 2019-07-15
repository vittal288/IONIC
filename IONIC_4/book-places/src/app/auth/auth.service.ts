import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isUserAuthenticated = false;
  constructor() {

  }
  get userIsAuthenticated() {
    return this._isUserAuthenticated;
  }
  login() {
    this._isUserAuthenticated = true;
  }

  logout() {
    this._isUserAuthenticated = false;
  }
}
