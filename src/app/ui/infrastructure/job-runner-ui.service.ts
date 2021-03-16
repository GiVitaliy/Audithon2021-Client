import { Injectable } from '@angular/core';
import { noop, Observable, Subject, Subscription, timer } from 'rxjs';
import { GroupOperationsService } from '../../logic/services/group-operations.service';
import { MetadataService } from '../../logic/services/metadata.service';
import { environment } from '../../../environments/environment';
import { AlertService } from './alert.service';
import {map} from 'rxjs/internal/operators';

@Injectable({ providedIn: 'root' })
export class JobRunnerUiService {
  public model: any = {
    operationId: undefined,
    operationTypeId: undefined,
    state: undefined,
    result: undefined,
    started: false,
    completed: false,
    canceling: false,
    completeSubj: undefined,
    isVolatile: false
  };

  private tickTimer: Observable<number>;
  private tickSub: Subscription;
  private checkingCurrentOperationStateActive = false;

  constructor(private groupOperationsService: GroupOperationsService,
              private metadataService: MetadataService,
              private alertService: AlertService) {
    this.tickTimer = timer(1000, 1000);
    this.tickSub = this.tickTimer.subscribe(t => this.checkCurrentOperationState());
  }

  public runOperation(opType: number, params: any, file?: any, data?: any, isVolatile?: boolean): Observable<any> {

    if (this.model.started) {
      return;
    }

    const model = this.model;
    model.started = true;
    model.completed = false;
    model.canceling = false;
    model.operationTypeId = opType;
    model.operationId = undefined;
    model.result = undefined;
    model.state = undefined;
    model.completeSubj = new Subject<any>();
    model.isVolatile = isVolatile;

    this.groupOperationsService.runOperation(this.model.operationTypeId, params, file, data).subscribe({
      next: opKey => {
        model.operationId = opKey.id;
      },
      error: () => {
        model.started = false;
      }
    });

    return model.completeSubj.asObservable();
  }

  public runOperationWithStarter(starter: () => Observable<any>, starterContext: any, opType: number,
                                 isVolatile?: boolean): Observable<any> {

    if (this.model.started) {
      return;
    }

    const model = this.model;
    model.started = true;
    model.completed = false;
    model.canceling = false;
    model.operationTypeId = opType;
    model.operationId = undefined;
    model.result = undefined;
    model.state = undefined;
    model.completeSubj = new Subject<any>();
    model.isVolatile = isVolatile;

    starter.apply(starterContext).pipe(map((response: any) => {
      return response.data;
    })).subscribe({
      next: opKey => {
        model.operationId = opKey.id;
      },
      error: () => {
        model.started = false;
      }
    });

    return model.completeSubj.asObservable();
  }

  public cancelOperation() {
    if (!this.model.started || this.model.completed || this.model.canceling || !this.model.operationId
      || !this.model.operationTypeId) {
      return;
    }

    const model = this.model;
    model.canceling = true;

    this.groupOperationsService.cancelOperation(this.model.operationTypeId, this.model.operationId).subscribe(noop);
  }

  public getPercProgress() {
    return this.model.state ? Math.floor(this.model.state.progress / 100) : 0;
  }

  private checkCurrentOperationState() {
    if (!this.model.operationId
      || (this.model.state && this.model.state.state === 3)
      || (this.model.state && this.model.state.state === 5)
      || this.checkingCurrentOperationStateActive) {
      return;
    }

    this.checkingCurrentOperationStateActive = true;

    this.groupOperationsService.getOperationStatus(this.model.operationTypeId, this.model.operationId)
      .subscribe({
        next: state => {
          this.checkingCurrentOperationStateActive = false;
          this.model.state = state;

          if (this.model.state.state === 3 || this.model.state.state === 5) {
            this.completeOperation(this.model.state.result);
          }
        },
        error: () => {
          this.checkingCurrentOperationStateActive = false;
        }
      });
  }

  private completeOperation(volatileResult: string) {

    if (this.model.completed) {
      return;
    }

    this.model.completed = true;
    this.model.canceling = false;

    // если волатильная операция прошла успешно, то для неё в последнем статусе возвращается сразу результат,
    // а сама операция удаляется на сервере, поэтому запрошивать по ней данные бесполезно - вернется ошибка
    if (this.model.isVolatile && volatileResult) {
      this.model.result = { result: volatileResult };
      this.model.started = false;
      this.navigateResults();
    } else {

      this.groupOperationsService.getOperationResult(this.model.operationTypeId, this.model.operationId)
        .subscribe(result => {
          this.model.result = result;
          this.model.started = false;

          if (this.model.result.result) {
            this.navigateResults();
          } else if (this.model.result.message) {
            this.alertService.error(this.model.result.message);
            this.model.completeSubj.error(this.model.result);
          }
        });
    }
  }

  private navigateResults() {
    this.model.completeSubj.next(this.model.result.result);

    // если операция волатильная, значит там уже конкретные результаты возвращаются в виде строки (например, JSON, см. строку выше),
    // а никаких файлов и т.п. в результатах уже нету и нечего скачивать и отображать
    if (!this.model.isVolatile) {
      this.metadataService.preloadFile(this.model.result.result).subscribe(fileHash => {
        window.open(environment.api + '/files/get?preloadId=' + encodeURIComponent(fileHash));
      });
    }
  }
}
