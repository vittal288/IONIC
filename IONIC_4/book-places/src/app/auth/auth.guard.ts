import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, Router, } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { take, tap, switchMap } from 'rxjs/operators';


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


    return this.authService.userIsAuthenticated.pipe(
      take(1),
      switchMap(userIsAuthenticated => {
        if (!userIsAuthenticated) {
          return this.authService.autoLogin();
        } else {
          return of(userIsAuthenticated);
        }
      }),
      tap(userIsAuthenticated => {
        // if is user us not authenticated then will redirects to auth page
        if (!userIsAuthenticated) {
          this.router.navigateByUrl('/auth');
        }
      }));
  }
}
