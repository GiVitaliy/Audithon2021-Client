import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import {finalize, tap} from 'rxjs/operators';
import { AlertService } from '../../ui/infrastructure/alert.service';
import { isString } from 'util';
import {ILogger, LoggerFactory} from '../../logger/logger.factory';

@Injectable()
export class AlertsHttpInterceptor implements HttpInterceptor {

  private logger: ILogger;

  constructor(private alertService: AlertService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.getLogger('EditPaymentDocumentComponent');
  }

  private lastDefaultError: Date;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.alertService.incrementHttpRequests();
    return next.handle(req).pipe(tap(
      // Succeeds when there is a response; ignore other events
      event => {
        if (event instanceof HttpResponse) {
          // this.alertService.decrementHttpRequests();
          if (event.body) {
            this.processMessages(event.body.messages);
          }
        }
      },
      // Operation failed; error is an HttpErrorResponse
      error => {
        if (error.error && error.error.messages) {
          this.processMessages(error.error.messages);
        } else {

          // показываем не чаще чем раз в секунду
          if (!this.lastDefaultError || (new Date().getTime() - this.lastDefaultError.getTime()) > 1000) {
            if (error.status === 0) {
              this.alertService.warning('Потеряно соединение с сервером');
            } else {
              this.logger.debug('intercept eror', error);
              this.alertService.warning('Операция не произведена из-за ошибок на сервере');
            }
          }

          this.lastDefaultError = new Date();
        }

        if (error.error && isString(error.error.data)
            && error.error.data !== 'NO-ACCESS'
            && error.error.data !== 'CONFLICT-ACCESS') {
          this.alertService.warning(error.error.data);
        } else if (error.error && isString(error.error.message)) {
          this.alertService.warning(error.error.message);
        }
      }
    ), finalize(() => {
      // ангуляр отменяет повторяющиеся запросы (скорее всего, при чистке Observable-ов),
      // а они не уменьшают счетчик, если не в finilize, который работает для любых ситуаций
      this.alertService.decrementHttpRequests();
    }));
  }

  processMessages(messages: any[]): any {
    if (!messages) {
      return;
    }
    messages.forEach(item => {
      switch (item.severity) {
        case 'Success':
          this.alertService.success(item.text || item.message);
          break;
        case 'Info':
          this.alertService.info(item.text || item.message);
          break;
        case 'Warning':
          this.alertService.warning(item.text || item.message);
          break;
        case 'Error':
          this.alertService.error(item.text || item.message);
          break;
      }
    });
  }
}
