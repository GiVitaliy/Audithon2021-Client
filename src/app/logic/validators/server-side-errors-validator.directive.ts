import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn } from '@angular/forms';
import { Directive, Input } from '@angular/core';
import { ServerSideErrorsProvider } from './server-side-errors-provider';
import {_} from 'ag-grid-community';

@Directive({
  selector: '[appServerSideValidate]',
  providers: [{provide: NG_VALIDATORS, useExisting: ServerSideErrorsValidatorDirective, multi: true}]
})
export class ServerSideErrorsValidatorDirective implements Validator {

  @Input() appServerSideValidate: string;

  constructor(private serverSideErrorsProvider: ServerSideErrorsProvider) {

  }

  validate(control: AbstractControl): { [key: string]: any } {
    return serverSideErrorsValidator(this.appServerSideValidate, this.serverSideErrorsProvider)(control);
  }
}

export function serverSideErrorsValidator(controlName: string,
                                          serverSideErrorsProvider: ServerSideErrorsProvider): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const errors = serverSideErrorsProvider.serverSideValidationErrors || [];

    const retVal = {};
    let i = 0;

    errors.forEach(error => {
      if (error.fieldName === controlName && control.value === error.badValue) {
        retVal[controlName + i.toString()] = {value: control.value, message: error.message};
        i++;
      }
    });

    return i > 0 ? retVal : null;
  };
}

export function serverSideErrorsArrayValidator(controlName: string,
                                          serverSideErrorsProvider: ServerSideErrorsProvider): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const errors = serverSideErrorsProvider.serverSideValidationErrors || [];

    const retVal = {};
    let i = 0;

    errors.forEach(error => {
      if (error.fieldName === controlName && _.jsonEquals(control.value, error.badValue)) {
        retVal[controlName + i.toString()] = {value: control.value, message: error.message};
        i++;
      }
    });

    return i > 0 ? retVal : null;
  };
}
