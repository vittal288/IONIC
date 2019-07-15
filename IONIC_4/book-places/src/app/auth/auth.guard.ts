import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, Router, } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})

/*
 *  canActivate cannot be applied to lazily loaded routes, because before auth guard validates the files get downloaded to browser , 
     hence we have to use canLoad
 */
export class AuthGuard implements CanLoad {
  constructor(private authService: AuthService, private router: Router) {

  }
  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    // if is user us not authenticated then will redirects to auth page
    if (!this.authService.userIsAuthenticated) {
      this.router.navigateByUrl('/auth');
    }
    return this.authService.userIsAuthenticated;
  }
}
