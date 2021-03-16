import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { AlertService } from '../../ui/infrastructure/alert.service';
import { isString } from 'util';
import { Router } from '@angular/router';

@Injectable()
export class UnavailableHttpInterceptor implements HttpInterceptor {

  constructor(private router: Router) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(tap(
      // Succeeds when there is a response; ignore other events
      () => {
      },
      // Operation failed; error is an HttpErrorResponse
      error => {
        if (error.status === 0) {
          this.router.navigate(['unavailable']);
        }
      }
    ));
  }
}
