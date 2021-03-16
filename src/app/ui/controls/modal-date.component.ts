import {Component} from '@angular/core';
import {Observable, of} from 'rxjs/index';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IModalBody, ModalResult} from '../../logic/services/app-navigation.service.models';
import {FormHelper} from './form-helper';

@Component({
  template: `
    <div class="form compact" [formGroup]="contextFormGroup">
      <section class="form-block itech-block-normal" style="overflow-y: hidden;">
        <div class="form-group">
          <label class="required">Дата с</label>
          <label for="date" aria-haspopup="true" role="tooltip"
                 class="tooltip tooltip-validation tooltip-md tooltip-bottom-right"
                 [class.invalid]="isInvalid('date')">
            <input formControlName="date" type="date" id="date" required>
            <app-validation-tooltip [input]="contextFormGroup.controls['date']"></app-validation-tooltip>
          </label>
        </div>
      </section>
    </div>
  `
})

export class ModalDateComponent implements IModalBody<any, any> {

  contextFormGroup: FormGroup;

  constructor(private fb: FormBuilder) {}

  isInvalid(controlName: string): boolean {
    return FormHelper.isInvalid(this.contextFormGroup, controlName);
  }

  initModalBody(data: any) {
    this.contextFormGroup = this.fb.group({
      date: [data.date, Validators.compose([FormHelper.validateDateTimePicker(), Validators.required])]
    });

  }

  onModalAccept$(): Observable<ModalResult<any>> {
    if (this.contextFormGroup && !this.contextFormGroup.valid) {
      return of(new ModalResult(false, null));
    }

    return of(new ModalResult(true, this.contextFormGroup.value));
  }
}
