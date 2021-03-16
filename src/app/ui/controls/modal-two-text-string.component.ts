import {Component} from '@angular/core';
import {Observable, of} from 'rxjs/index';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IModalBody, ModalResult} from '../../logic/services/app-navigation.service.models';
import {FormHelper} from './form-helper';
import {ValidatorFn} from '@angular/forms/src/directives/validators';

export class ModalTwoTextParams {
  title1: string;
  title2: string;
  defaultValue1: string;
  defaultValue2: string;
  validators1: ValidatorFn[];
  validators2: ValidatorFn[];
}

export class ModalTwoTextResult {
  value1: string;
  value2: string;
}

@Component({
  template: `
    <div class="form compact" [formGroup]="contextFormGroup">
      <section class="form-block itech-block-normal">
        <div class="form-group">
          <label class="required">{{ title1 }}</label>
          <label for="value1" aria-haspopup="true" role="tooltip"
                 class="tooltip tooltip-validation tooltip-md tooltip-top-left"
                 [class.invalid]="isInvalid('value1')">
            <input formControlName="value1" type="text" id="value1" class="itech-control-medium"
                   placeholder="{{ title1 }}">
            <app-validation-tooltip [input]="contextFormGroup.controls['value1']"></app-validation-tooltip>
          </label>
        </div>
        <div class="form-group">
          <label class="required">{{ title2 }}</label>
          <label for="value2" aria-haspopup="true" role="tooltip"
                 class="tooltip tooltip-validation tooltip-md tooltip-top-left"
                 [class.invalid]="isInvalid('value2')">
            <input formControlName="value2" type="text" id="value2" class="itech-control-medium"
                   placeholder="{{ title2 }}">
            <app-validation-tooltip [input]="contextFormGroup.controls['value2']"></app-validation-tooltip>
          </label>
        </div>
      </section>
    </div>
  `
})

export class ModalTwoTextStringComponent implements IModalBody<ModalTwoTextParams, ModalTwoTextResult> {

  contextFormGroup: FormGroup;
  title1: string;
  title2: string;

  constructor(private fb: FormBuilder) {
  }

  isInvalid(controlName: string): boolean {
    return FormHelper.isInvalid(this.contextFormGroup, controlName);
  }

  initModalBody(data: ModalTwoTextParams) {
    // title для наименования полей в модальном окне
    // validators - массив вадидаторов, чтобы добавить в контролы
    this.title1 = data.title1;
    this.title2 = data.title2;
    const validators1 = data.validators1 ? data.validators1 : [];
    const validators2 = data.validators2 ? data.validators2 : [];
    this.contextFormGroup = this.fb.group({
      value1: [data.defaultValue1, Validators.compose([Validators.required, ...validators1])],
      value2: [data.defaultValue2, Validators.compose([Validators.required, ...validators2])],
    });

  }

  onModalAccept$(): Observable<ModalResult<ModalTwoTextResult>> {
    if (this.contextFormGroup && !this.contextFormGroup.valid) {
      return of(new ModalResult(false, null));
    }

    return of(new ModalResult(true, this.contextFormGroup.value));
  }
}
