import { Injectable } from '@angular/core';
import {from, Observable, of} from 'rxjs';
import {catchError, concatMap, map, tap} from 'rxjs/internal/operators';
import {isString} from 'util';
import {ILogger, LoggerFactory} from '../logger/logger.factory';

@Injectable()
export class ProcessingHelper {

  private logger: ILogger;
  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.getLogger('ProcessingHelper');
  }

  processItems$(items: any[],
                itemProcessing: (value: any) => Observable<any>,
                itemSuccessProcessing: (value: any, result: any) => void,
                itemErrorProcessing: (value: any, err: any) => void) {
    const processor$ = from(items).pipe(
      concatMap(item =>
        itemProcessing(item).pipe(
          catchError((err) => {
            this.logger.error('Error during processing of item', item, err);
            let msg = '';
            if (err.error && err.error.messages) {
              msg += err.error.messages.map(m => m.text || m.message).join('; ');
            }
            if (err.error && isString(err.error.data)) {
              msg += msg ? '; ' : '' + err.error.data;
            }

            itemErrorProcessing(item, msg ? msg : err);
            return of({ isError: true, error: msg ? msg : err});
          }),
          tap((itemResult: any) => {
            if (itemResult && !itemResult.isError) {
              itemSuccessProcessing(item, itemResult);
            }
          }))
      )
    );

    return processor$;
  }
}
