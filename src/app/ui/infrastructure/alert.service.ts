import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import {environment} from '../../../environments/environment';

@Injectable()
export class AlertService {
  private subject = new Subject<any>();
  private keepAfterNavigationChange = false;

  public confirmModalMsg = '';
  public confirmModalAcceptButtonText = '';
  public requiredConfirmAction = false;
  public requiredConfirmActionText = '';
  public confirmModalOpened = false;
  public confirmModalAcceptPromise: Subject<boolean>;

  public alertModalMsg = '';
  public alertModalTitle = '';
  public alertModalOpened = false;
  public alertModalRawHtml = false;
  public alertModalAcceptPromise: Subject<boolean>;

  constructor(private router: Router,
              private toastr: ToastrService) {
    // clear alert message on route change
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterNavigationChange) {
          // only keep for a single location change
          this.keepAfterNavigationChange = false;
        } else {
          // clear alert
          this.subject.next();
        }
      }
    });
  }

  private _activeHttpRequests = 0;
  private _activeHttpRequestsObs = new BehaviorSubject(0);

  public get activeHttpRequests(): Observable<number> {
    return this._activeHttpRequestsObs;
  }

  public incrementHttpRequests() {
    this._activeHttpRequests++;
    setTimeout(() => {
      if (this._activeHttpRequestsObs.getValue() !== this._activeHttpRequests) {
        this._activeHttpRequestsObs.next(this._activeHttpRequests);
      }
    }, 500);
  }

  public decrementHttpRequests() {
    if (this._activeHttpRequests > 0) {
      this._activeHttpRequests--;
    }
    setTimeout(() => {
      if (this._activeHttpRequestsObs.getValue() !== this._activeHttpRequests) {
        this._activeHttpRequestsObs.next(this._activeHttpRequests);
      }
    }, 500);
  }

  extractMessageToShow(message: any): any {
    if (message) {
      // надо обновить toastr, чтобы он мог показывать html
      return ((message.message || message) || '').replace(/\n/g, ' ____ ');
    } else {
      return 'Операция завершена без дополнительных уведомлений';
    }
  }

  success(message: any, keepAfterNavigationChange = false) {
    this.toastr.success(this.extractMessageToShow(message));
  }

  info(message: any, keepAfterNavigationChange = false) {
    this.toastr.info(this.extractMessageToShow(message));
  }

  error(message: any, keepAfterNavigationChange = false) {
    if (environment.errorPopupTimeout || environment.errorPopupTimeout === 0 ) {
      this.toastr.error(this.extractMessageToShow(message), null, {timeOut: environment.errorPopupTimeout});
    } else {
      this.toastr.error(this.extractMessageToShow(message));
    }

  }

  warning(message: any, keepAfterNavigationChange = false) {
    if (environment.errorPopupTimeout || environment.errorPopupTimeout === 0 ) {
      this.toastr.warning(this.extractMessageToShow(message), null, {timeOut: environment.errorPopupTimeout});
    } else {
      this.toastr.warning(this.extractMessageToShow(message));
    }
  }

  confirmModal(msg: string, acceptButtonText: string = 'Да', condition = true, requiredConfirmAction = false, requiredConfirmActionText = ''): Observable<boolean> {
    this.confirmModalAcceptPromise = new Subject<boolean>();

    if (condition) {
      this.confirmModalMsg = msg;
      this.confirmModalAcceptButtonText = acceptButtonText;
      this.confirmModalOpened = true;
      this.requiredConfirmAction = requiredConfirmAction;
      this.requiredConfirmActionText = requiredConfirmActionText;
    } else {
      setTimeout(() => {
        this.confirmModalAcceptPromise.next(true);
      }, 1);
    }
    return this.confirmModalAcceptPromise.asObservable();
  }

  alertModal(title: string, msg: string, useRawHtml = false): Observable<boolean> {
    this.alertModalAcceptPromise = new Subject<boolean>();

    this.alertModalTitle = title;
    this.alertModalMsg = msg;
    this.alertModalRawHtml = useRawHtml;
    this.alertModalOpened = true;
    return this.alertModalAcceptPromise.asObservable();
  }
}
