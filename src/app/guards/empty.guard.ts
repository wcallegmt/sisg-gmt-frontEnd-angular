import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class EmptyGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(): boolean {
    if ( !localStorage.getItem('token') ) {
      this.router.navigateByUrl('login');
    }
    return true;
  }
}
