import { Injectable } from '@angular/core';
import { Observable ,  Subject } from 'rxjs';

@Injectable()
export class GlobalWaitingOverlayService {

  private _waitingPromise: Subject<boolean> = new Subject<boolean>();

  get waiting(): Observable<boolean> {
    return this._waitingPromise;
  }

  public StartWaiting() {
    setTimeout(() => {
      this._waitingPromise.next(true);
    }, 10);
  }

  public EndWaiting() {
    setTimeout(() => {
      this._waitingPromise.next(false);
    }, 10);
  }
}
