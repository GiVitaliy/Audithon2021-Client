import { OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, Subscription, timer } from 'rxjs';

import { DataCachingService } from '../logic/services/data-caching.service';
import { GroupOperationsService } from '../logic/services/group-operations.service';
import { MetadataService } from '../logic/services/metadata.service';
import { FormHelper } from './controls/form-helper';
import { environment } from '../../environments/environment';

export abstract class GroupOperationBaseComponent implements OnInit, OnDestroy {

  abstract OperationParamsCode;
  abstract OperationTypeId;
  abstract ComponentModelCacheId;

  model: any = {
    form: undefined,
    operationId: undefined,
    operationTypeId: undefined,
    state: undefined,
    result: undefined,
    started: false,
    completed: false,
    canceling: false,
    startedFromOtherUi: false
  };

  private tickTimer: Observable<number>;
  private tickSub: Subscription;

  abstract addBookmark(params: ParamMap);
  abstract getOpParamsGroupDef(params: ParamMap): any;

  get contextFormGroup(): FormGroup {
    return this.model.form;
  }

  constructor(protected fb: FormBuilder,
              protected dataCachingService: DataCachingService,
              protected route: ActivatedRoute,
              protected groupOperationsService: GroupOperationsService,
              protected metadataService: MetadataService) {
  }

  ngOnInit(): void {
    this.tickTimer = timer(1000, 1000);
    this.tickSub = this.tickTimer.subscribe(t => this.checkCurrentOperationState());

    this.route.paramMap
      .subscribe(params => {

        const randomUniqueTag = params.get('uniqueTag');

        const existing = this.dataCachingService.getCachedData(this.ComponentModelCacheId, randomUniqueTag);

        if (!existing) {

          if (randomUniqueTag.startsWith('new$')) {
            this.model.operationId = undefined;
          } else {
            this.model.operationId = +randomUniqueTag;
            this.model.started = true;
            this.model.startedFromOtherUi = true;
          }

          this.model.operationTypeId = this.OperationTypeId;

          this.model.form = this.fb.group(this.getOpParamsGroupDef(params));

          this.dataCachingService.addToCache(this.ComponentModelCacheId, randomUniqueTag,
            this.model);
        } else {
          this.model = existing;
        }

        this.addBookmark(params);
        this.formDataInit();
      });
  }

  ngOnDestroy(): void {
    if (this.tickSub) {
      this.tickSub.unsubscribe();
      this.tickSub = undefined;
    }
  }

  checkCurrentOperationState() {
    if (!this.model.operationId
      || (this.model.state && this.model.state.state === 3)
      || (this.model.state && this.model.state.state === 5)) {
      return;
    }

    this.groupOperationsService.getOperationStatus(this.model.operationTypeId, this.model.operationId)
      .subscribe(state => {
        this.model.state = state;

        if (this.model.state.state === 3 || this.model.state.state === 5) {
          this.completeOperation();
        }
      });
  }

  createReport() {
    if (!this.contextFormGroup.valid || this.model.started) {
      return;
    }

    const model = this.model;
    model.started = true;

    this.groupOperationsService.runOperation(this.model.operationTypeId, this.contextFormGroup.value).subscribe(
      opKey => {
        model.operationId = opKey.id;
      },
      () => {
        model.started = false;
      }
    );
  }

  cancelOperation() {
    if (!this.model.started || this.model.completed || this.model.canceling || !this.model.operationId) {
      return;
    }

    const model = this.model;
    model.canceling = true;

    this.groupOperationsService.cancelOperation(this.model.operationTypeId, this.model.operationId).subscribe(
      () => {
      },
      () => {
      }
    );
  }

  isInvalid(cname: string) {
    return FormHelper.isInvalid(this.contextFormGroup, cname);
  }

  private completeOperation() {

    if (this.model.completed) {
      return;
    }

    this.model.completed = true;
    this.model.canceling = false;

    this.groupOperationsService.getOperationResult(this.model.operationTypeId, this.model.operationId)
      .subscribe(result => {
        this.model.result = result;

        if (this.model.result.result && !this.model.startedFromOtherUi) {
          this.navigateResults();
        }
      });
  }

  navigateResults() {
    this.metadataService.preloadFile(this.model.result.result).subscribe(fileHash => {
      window.open(environment.api + '/files/get?preloadId=' + encodeURIComponent(fileHash));
    });
  }

  getPercProgress() {
    return this.model.state ? Math.floor(this.model.state.progress / 100) : 0;
  }

  // для компонентов наследников, чтобы добавить запросы и лукапы в ngOnInit
  formDataInit() {}

}
