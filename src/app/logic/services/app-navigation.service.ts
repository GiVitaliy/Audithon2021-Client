import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { GroupOperationReportsMetadataService } from './group-operation-reports-metadata.service';
import { Type } from '@angular/core/src/type';
import { ModalParams, ModalSize } from './app-navigation.service.models';
import { MetadataService } from './metadata.service';
import { environment } from '../../../environments/environment';
import { AlertService } from '../../ui/infrastructure/alert.service';

@Injectable()
export class AppNavigationService {

  public customModalParams: any = {};
  public customModalOpened = false;
  public customModalTitle = 'Действие';
  public customModalAcceptButtonText = 'ОК';
  public customModalAcceptPressed = false;
  public customModalSize = 'sm';
  public customModalComponent = undefined;
  public customModalAcceptExternalPromise: Subject<any>;
  public customPrintComponent = undefined;
  public customPrintReady = new EventEmitter<any>();
  public customPrintParams: any = {};

  public versionHistoryOpened = false;

  constructor(private router: Router,
              private metadataService: MetadataService,
              private groupOperationReportsMetadataService: GroupOperationReportsMetadataService,
              private alertService: AlertService) {
  }

  public navigateGroupOperation(jobData: any) {
    const params = JSON.parse(jobData.parameters);
    params.uniqueTag = jobData.id;
    this.groupOperationReportsMetadataService.getReportMetadataByJobTypeId$(jobData.typeId, params.reportId).subscribe(opMeta => {
      if (opMeta) {
        this.performGeneralGroupOpReport(opMeta.operationParamsCode, params);
      } else {
        if (jobData.result) {
          this.metadataService.preloadFile(jobData.result).subscribe(fileHash => {
            window.open(environment.api + '/files/get?preloadId=' + encodeURIComponent(fileHash));
          });
        } else if (jobData.message) {
          this.alertService.error('Результат нештатно завершившейся массовой операции: ' + jobData.message);
        }
      }
    });
  }

  public performGeneralGroupOpReport(opCode: string, params?: any) {
    this.groupOperationReportsMetadataService.getOpDefaultParams$(opCode).subscribe(defaultParams => {
      this.router.navigate(['/reports/general', opCode, (params || defaultParams).uniqueTag, params || defaultParams]);
    });
  }

  public navigateJournal(userId: number, objKindId?: number, objId1?: number, objId2?: number) {
    this.router.navigate(['/journal', {userId: userId, objKindId: objKindId, objId1: objId1, objId2: objId2}]);
  }

  public showModal<TComponent, TParams, TResult>(component: Type<TComponent>,
                                                 params: ModalParams<TParams>): Observable<TResult> {
    if (params.size) {
      switch (params.size) {
        case ModalSize.sm:
          this.customModalSize = 'sm';
          break;
        case ModalSize.medium:
          this.customModalSize = '';
          break;
        case ModalSize.lg:
          this.customModalSize = 'lg';
          break;
        case ModalSize.xl:
          this.customModalSize = 'xl';
          break;
        default:
          this.customModalSize = '';
          break;
      }
    } else {
      this.customModalSize = '';
    }

    this.customModalComponent = component;
    this.customModalTitle = params.title ? params.title : '';
    this.customModalAcceptButtonText = params.acceptText ? params.acceptText : 'OK';
    this.customModalParams = params.initBodyParams;

    this.customModalAcceptPressed = false;
    this.customModalOpened = true;

    this.customModalAcceptExternalPromise = new Subject<TResult>();
    return this.customModalAcceptExternalPromise.asObservable();
  }
}
