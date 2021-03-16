import {Component} from '@angular/core';
import {Observable, of} from 'rxjs/index';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IModalBody, ModalResult} from '../../logic/services/app-navigation.service.models';
import {FormHelper} from './form-helper';

export class ModalDateFromToParams {
  dateFrom: any;
  dateTo: any;
}

@Component({
  template: `
    <div class="form compact" [formGroup]="contextFormGroup">
      <section class="form-block itech-block-normal" style="overflow-y: hidden;">
        <div class="form-group">
          <label class="required">Дата с</label>
          <label for="dateFrom" aria-haspopup="true" role="tooltip"
                 class="tooltip tooltip-validation tooltip-md tooltip-bottom-right"
                 [class.invalid]="isInvalid('dateFrom')">
            <input formControlName="dateFrom" type="date" id="dateFrom" required>
            <app-validation-tooltip [input]="contextFormGroup.controls['dateFrom']"></app-validation-tooltip>
          </label>
        </div>
        <div class="form-group">
          <label class="required">Дата по</label>
          <label for="dateTo" aria-haspopup="true" role="tooltip"
                 class="tooltip tooltip-validation tooltip-md tooltip-bottom-right"
                 [class.invalid]="isInvalid('dateTo')">
            <input type="date" id="dateTo" formControlName="dateTo" required>
            <app-validation-tooltip [input]="contextFormGroup.controls['dateTo']"></app-validation-tooltip>
          </label>
        </div>
      </section>
    </div>
  `
})

export class ModalDateFromToComponent implements IModalBody<ModalDateFromToParams, ModalDateFromToParams> {

  contextFormGroup: FormGroup;

  constructor(private fb: FormBuilder) {}

  isInvalid(controlName: string): boolean {
    return FormHelper.isInvalid(this.contextFormGroup, controlName);
  }

  initModalBody(data: ModalDateFromToParams) {
    this.contextFormGroup = this.fb.group({
      dateFrom: [data.dateFrom, Validators.compose([FormHelper.validateDateTimePicker(), Validators.required])],
      dateTo: [data.dateTo, Validators.compose([FormHelper.validateDateTimePicker(), Validators.required])]
    });

  }

  onModalAccept$(): Observable<ModalResult<ModalDateFromToParams>> {
    if (this.contextFormGroup && !this.contextFormGroup.valid) {
      return of(new ModalResult(false, null));
    }

    return of(new ModalResult(true, this.contextFormGroup.value));
  }
}
