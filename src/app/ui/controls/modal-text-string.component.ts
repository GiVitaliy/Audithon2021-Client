import {Component} from '@angular/core';
import {Observable, of} from 'rxjs/index';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IModalBody, ModalResult} from '../../logic/services/app-navigation.service.models';
import {FormHelper} from './form-helper';
import {ValidatorFn} from '@angular/forms/src/directives/validators';

export class ModalTextParams {
  title: string;
  defaultValue: string;
  validators: ValidatorFn[];
}

@Component({
  template: `
    <div class="form compact" [formGroup]="contextFormGroup">
      <section class="form-block itech-block-normal">
        <div class="form-group">
          <label>{{ title }}</label>
          <label for="value" aria-haspopup="true" role="tooltip"
                 class="tooltip tooltip-validation tooltip-md tooltip-top-left"
                 [class.invalid]="isInvalid('value')">
            <input formControlName="value" type="text" id="value" class="itech-control-medium"
                   placeholder="{{ title }}">
            <app-validation-tooltip [input]="contextFormGroup.controls['value']"></app-validation-tooltip>
          </label>
        </div>
      </section>
    </div>
  `
})

export class ModalTextStringComponent implements IModalBody<ModalTextParams, string> {

  contextFormGroup: FormGroup;
  title: string;

  constructor(private fb: FormBuilder) {
  }

  isInvalid(controlName: string): boolean {
    return FormHelper.isInvalid(this.contextFormGroup, controlName);
  }

  initModalBody(data: ModalTextParams) {
    // title для наименования поля в модальном окне
    // validators - массив вадидаторов, чтобы добавить в контрол
    this.title = data.title;
    const validators = data.validators ? data.validators : [];
    this.contextFormGroup = this.fb.group({
      value: [data.defaultValue, Validators.compose([Validators.required, ...validators])],
    });

  }

  onModalAccept$(): Observable<ModalResult<string>> {
    if (this.contextFormGroup && !this.contextFormGroup.valid) {
      return of(new ModalResult(false, null));
    }

    return of(new ModalResult(true, this.contextFormGroup.get('value').value));
  }
}
