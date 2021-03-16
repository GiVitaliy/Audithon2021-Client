import {
  AbstractControl,
  FormArray,
  FormControl, FormControlDirective, FormControlName,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {ServerSideErrorsProvider} from '../../logic/validators/server-side-errors-provider';
import {serverSideErrorsValidator} from '../../logic/validators/server-side-errors-validator.directive';
import {DateHelper} from '../../helpers/date-helper';

// nativeElement добавляется во все контролы - за счет этого можно обратиться к nativeElement и вызвать focus()
// Проверить производительность. Если будет тормозить - убирать - но также нужно убрать все вызовы setFocusToInvalidControl
const originFormControlNgOnChanges = FormControlDirective.prototype.ngOnChanges;
FormControlDirective.prototype.ngOnChanges = function () {
  this.form.nativeElement = this.valueAccessor._elementRef.nativeElement;
  return originFormControlNgOnChanges.apply(this, arguments);
};

const originFormControlNameNgOnChanges = FormControlName.prototype.ngOnChanges;
FormControlName.prototype.ngOnChanges = function () {
  const result = originFormControlNameNgOnChanges.apply(this, arguments);
  this.control.nativeElement = this.valueAccessor._elementRef ? this.valueAccessor._elementRef.nativeElement : null;
  return result;
};

export class FormHelper {
  static noErrors = [];

  public static isInvalid(fg: FormGroup, controlName: string): boolean {
    const control = fg.controls[controlName];
    if (!control) {
      return true;
    }
    return control.invalid && (control.dirty || control.touched || FormHelper.isSubmitted(fg));
  }

  public static equalsSome(value: any, ...probeValues: any[]): boolean {
    if (!probeValues || !probeValues.length) {
      return false;
    }

    return probeValues.some(el => el == value);
  }

  public static isInvalidControl(control: AbstractControl): boolean {
    if (!control) {
      return true;
    }
    return control.invalid && (control.dirty || control.touched || FormHelper.isSubmitted(control.parent));
  }

  public static markAsSubmitted(fg: FormGroup) {
    (fg as any).submitted = true;
    FormHelper.markAsTouched(fg);
    fg.updateValueAndValidity({onlySelf: true});
  }

  public static markAsTouched(fg: FormGroup | FormArray) {
    Object.keys(fg.controls).forEach(field => {
      const control = fg.get(field);
      control.markAsTouched({onlySelf: true});
      // updateValueAndValidity работает рекурсивно для всех контролов, но обновляет только сам контрол, поэтому обязательно
      // указывать onlySelf: true, иначе для больших форм отрабатывает очень долго
      control.updateValueAndValidity({onlySelf: true});

      if (control instanceof FormGroup) {
        FormHelper.markAsTouched(control as FormGroup);
      } else if (control instanceof FormArray) {
        FormHelper.markAsTouched(control as FormArray);
      }
    });
  }

  public static isSubmitted(fg: AbstractControl): boolean {
    while (fg) {
      if ((fg as any).submitted) {
        return true;
      }
      fg = fg.parent;
    }
    return false;
  }

  public static setSingleFormGroupServerSideValidationErrors(error: any,
                                                             validationErrorsHostObj: { serverSideValidationErrors: any[] },
                                                             fg: FormGroup, defer: boolean = true) {
    validationErrorsHostObj.serverSideValidationErrors = error.error && error.error.data && error.error.data[0]
    && !error.error.data.localeCompare
      ? error.error.data[0]
      : undefined;

    (fg as any).docLevelServerSideValidationErrors = [];

    if (!validationErrorsHostObj.serverSideValidationErrors) {
      return;
    }

    if (!Array.isArray(validationErrorsHostObj.serverSideValidationErrors)) {
      validationErrorsHostObj.serverSideValidationErrors = [validationErrorsHostObj.serverSideValidationErrors];
    }

    const action = () => {
      validationErrorsHostObj.serverSideValidationErrors.forEach(item => {
        if (item.violationType === 'relation') {
          FormHelper.setSingleFormGroupServerSideValidationErrors({error: {data: {'0': item.ruleViolations}}},
            {serverSideValidationErrors: []},
            fg.get(item.relationName) as FormGroup);
        } else if (item.violationType === 'collection') {
          if (fg.controls[item.fieldName]) {
            const formArray = fg.controls[item.fieldName] as FormArray;
            if (formArray) {
              item.ruleViolations.forEach(ruleViolation => {
                FormHelper.setSingleFormGroupServerSideValidationErrors({error: {data: {'0': ruleViolation.ruleViolations}}},
                  {serverSideValidationErrors: []}, formArray.controls[ruleViolation.itemIndex] as FormGroup, false);
              });
            }
          }
        } else if (item.fieldName) {
          const control = (fg as any).controls[item.fieldName];
          if (control) {
            item.badValue = control.value;
            control.updateValueAndValidity();
          } else {
            // если в fg нет такого контрола, продублируем ошибку в docLevelServerSideValidationErrors
            (fg as any).docLevelServerSideValidationErrors.push(item);
          }
        } else {
          // ошибка колекции на уровне строки элемента FormArray добавляется также в docLevelServerSideValidationErrors
          // также необходимо добавить отдельный столбец в грид для отображения ошибок (tooltip)
          (fg as any).docLevelServerSideValidationErrors.push(item);
        }
      });
    };

    if (defer) {
      setTimeout(action, 1);
    } else {
      action();
    }
  }

  public static getChar(event) {
    if (event.which == null) { // IE
      if (event.keyCode < 32) { // спец. символ
        return null;
      }
      return String.fromCharCode(event.keyCode);
    }

    if (event.which !== 0 && event.charCode !== 0) { // все кроме IE
      if (event.which < 32) {
        return null;  // спец. символ
      }
      return String.fromCharCode(event.which); // остальные
    }

    return null; // спец. символ
  }

  public static processMoneyKeypress(e: any, allowNegate?: boolean): boolean {
    if (e.ctrlKey || e.altKey || e.metaKey) { // спец. сочетание - не обрабатываем
      return false;
    }

    const char = FormHelper.getChar(e);

    if (char === '0' || char === '1' || char === '2' || char === '3' || char === '4' || char === '5' || char === '6'
      || char === '7' || char === '8' || char === '9' || char === ',' || (allowNegate && char === '-')) {
      return true;
    } else if (char === '/' || char === '.' || char === '?' || char === '<' || char === '>' || char === 'б'
      || char === 'Б' || char === 'ю' || char === 'Ю') {

      const caret = FormHelper.getCaretPosition(e.target);
      let val = e.target.value;
      val = val.substr(0, caret) + ',' + val.substr(caret);
      e.target.value = val;
    }
    return false;
  }

  public static processMoneyKeypressDot(e: any): boolean {
    if (e.ctrlKey || e.altKey || e.metaKey) { // спец. сочетание - не обрабатываем
      return false;
    }

    const char = FormHelper.getChar(e);

    if (char === '0' || char === '1' || char === '2' || char === '3' || char === '4' || char === '5' || char === '6'
      || char === '7' || char === '8' || char === '9' || char === '.') {
      return true;
    } else if (char === '/' || char === ',' || char === '?' || char === '<' || char === '>' || char === 'б'
      || char === 'Б' || char === 'ю' || char === 'Ю') {

      const caret = FormHelper.getCaretPosition(e.target);
      let val = e.target.value;
      val = val.substr(0, caret) + '.' + val.substr(caret);
      e.target.value = val;
    }
    return false;
  }

  public static getCaretPosition(oField: any) {

    // Initialize
    let iCaretPos = 0;

    if ((document as any).selection) { // IE Support

      // Set focus on the element
      oField.focus();

      // To get cursor position, get empty selection range
      const oSel = (document as any).selection.createRange();

      // Move selection start to 0 position
      oSel.moveStart('character', -oField.value.length);

      // The caret position is selection length
      iCaretPos = oSel.text.length;
    } else if (oField.selectionStart || oField.selectionStart === '0') {    // Firefox support
      iCaretPos = oField.selectionStart;
    }

    // Return results
    return iCaretPos;
  }

  public static getApplicationMoneyValidator(): any {
    return Validators.pattern(/^\d*,?\d{0,2}$/);
  }

  public static getApplicationMoneyValidatorN(): any {
    return Validators.pattern(/^-?\d*,?\d{0,2}$/);
  }

  public static getApplicationMoneyValidatorDot(): any {
    return Validators.pattern(/^\d*\.?\d{0,2}$/);
  }

  public static getApplicationMoneyValidatorNDot(): any {
    return Validators.pattern(/^-?\d*\.?\d{0,2}$/);
  }

  public static getApplicationExpensesValidatorN(): any {
    return Validators.pattern(/^-?\d*,?\d{0,4}$/);
  }

  public static toAppMoneyString(amount: any): string {
    if (!amount && amount !== 0) {
      return undefined;
    }

    amount = Math.round(amount * 100) / 100;

    return amount.toString().replace(/\./g, ',');
  }

  public static toAppExpensesString(amount: any): string {
    if (!amount && amount !== 0) {
      return undefined;
    }

    amount = Math.round(amount * 10000) / 10000;

    return amount.toString().replace(/\./g, ',');
  }

  public static fromAppMoneyString(amount: any): number {
    if (!amount) {
      return undefined;
    }

    return Number.parseFloat(amount.toString().replace(/,/g, '.'));
  }

  public static normalizeAppMoneyString(amount: any): number {
    if (!amount) {
      return undefined;
    }

    return amount.toString().replace(/,/g, '.');
  }

  public static normalizeAppMoneyStringFactor10000(amount: any): number {
    if (!amount) {
      return undefined;
    }

    return Number(amount.toString().replace(/,/g, '.')) * 10000;
  }

  // Этим мы боремся с вполне допустимыми значениями в пикере типа 12345-01-01, из за чего это все не может корректно
  // прийти на сервер и Spring JSON Serializer падает с соответствующей ошибкой, а пользователю приходит ничего не значащая
  // для него ошибка 500. Валидатор должнен стояти на каждом из контролов
  public static validateDateTimePicker(): ValidatorFn {
    return Validators.pattern(/^\d{4}-\d{2}-\d{2}(T\w.*)*$/);
  }

  public static conditionalValidate(validatorFn: ValidatorFn, conditionFn: (control: AbstractControl) => boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return conditionFn(control) ? validatorFn(control) : null;
    };
  }

  public static putControlDefWithSSV(formGroupDef: any,
                                     dataObj: any,
                                     fieldName: string,
                                     serverSideErrorsProvider: ServerSideErrorsProvider,
                                     ...validators: ValidatorFn[]) {

    validators.push(serverSideErrorsValidator(fieldName, serverSideErrorsProvider));

    FormHelper.putControlDef(formGroupDef, dataObj, fieldName, ...validators);
  }

  public static putControlDef(formGroupDef: any,
                              dataObj: any,
                              fieldName: string,
                              ...validators: ValidatorFn[]) {

    formGroupDef[fieldName] = [dataObj ? dataObj[fieldName] : undefined, Validators.compose(validators)];
  }

  public static getControlErrorText(control: AbstractControl) {
    return FormHelper.getControlErrorArray(control).join('; ');
  }

  public static getControlErrorArray(control: AbstractControl): string[] {

    if (!control || !control.errors) {
      return FormHelper.noErrors;
    }

    const errorsObj = control.errors as any;
    const errors = [];

    for (const propertyName in errorsObj) {
      if (propertyName === 'pattern') {
        errors.push('Поле имеет некорректный формат');
      } else if (propertyName === 'required') {
        errors.push('Поле является обязательным к заполнению');
      } else if (propertyName === 'min') {
        errors.push(`Значение не должно быть меньше '${errorsObj.min.min}'`);
      } else if (propertyName === 'max') {
        errors.push(`Значение не должно превышать '${errorsObj.max.max}'`);
      } else if (propertyName === 'maxlength') {
        errors.push(`Строка не должна быть длинее ${errorsObj.maxlength.requiredLength} символов`);
      } else {
        errors.push(errorsObj[propertyName].message);
      }
    }
    return errors;
  }

  public static findInvalidControls(form: FormGroup) {
    const invalid = [];
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  public static findInvalidControlsRecursive(formToInvestigate: FormGroup | FormArray): FormControl[] {
    const invalidControls = [];
    const recursiveFunc = (form: FormGroup | FormArray) => {
      Object.keys(form.controls).forEach(field => {
        const control = form.get(field);
        if (control instanceof FormGroup) {
          recursiveFunc(control);
        } else if (control instanceof FormArray) {
          recursiveFunc(control);
        } else if (control.invalid) {
          invalidControls.push(control);
        }
      });
    };
    recursiveFunc(formToInvestigate);
    return invalidControls;
  }

  public static findFirstInvalidControlRecursive(formToInvestigate: FormGroup | FormArray): FormControl {
    let invalidControl = null;
    const recursiveFunc = (form: FormGroup | FormArray) => {
      for (const field of Object.keys(form.controls)) {
        const control = form.get(field);
        if (!invalidControl && control instanceof FormGroup) {
          recursiveFunc(control);
        } else if (!invalidControl && control instanceof FormArray) {
          recursiveFunc(control);
        } else if (!invalidControl && control.invalid && field === 'dateTo' && form.get('dateToIncluded').value) {
          // если invalid контрол - это dateTo и dateToIncluded заполнен, то нужно перейти к контролу dateToIncluded
          invalidControl = form.get('dateToIncluded');
          break;
        } else if (!invalidControl && control.invalid) {
          invalidControl = control;
          break;
        }
      }
    };
    recursiveFunc(formToInvestigate);
    return invalidControl;
  }

  public static setFocusToInvalidControl(form: FormGroup) {
    const invalidControl = FormHelper.findFirstInvalidControlRecursive(form);
    if (invalidControl && (<any>invalidControl).nativeElement) {
      (<any>invalidControl).nativeElement.focus();
    }
  }

  public static minArrayLengthValidator(length?: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {

      if (control.value && control.value.length < (length ? length : 1)) {
        const retVal = {
          arrayMinLength: {
            value: control.value,
            message: 'Недостаточное число элементов.'
          }
        }
        return retVal;
      } else {
        return null;
      }
    };
  }

  public static setValIfChanged(ctrl: AbstractControl, value: any) {
    if (ctrl.value != value) {
      ctrl.setValue(value);
      ctrl.markAsDirty();
    }
  }

  static validateDateMoreThan(startDatePropertyName: string): ValidatorFn {
    return control => {
      if (!control || !control.value || !startDatePropertyName) {
        return null;
      }

      const form = control.parent as FormGroup;
      const startDateControl = form.get(startDatePropertyName) as FormControl;
      if (!startDateControl || !startDateControl.value) {
        return null;
      }

      const dateValue = new Date(control.value);
      const startDate = new Date(startDateControl.value);

      if (dateValue < startDate) {
        return {custom: {message: 'Дата окончания не может быть меньше даты начала'}};
      }
      return null;
    };
  }

  static validateDateNotFuture(control: AbstractControl) {
    if (!control || !control.value) {
      return null;
    }

    const dateValue = new Date(control.value);
    if (DateHelper.isAfter(dateValue, new Date()) === 1) {
      return {custom: {message: 'Дата не может быть больше текущей'}};
    }

    return null;
  }

  static validateRuAddrInput(control: AbstractControl) {
    if (!control || !control.value) {
      return null;
    }
    return Validators.pattern('^[ а-яА-Я0-9.,/\-]*$')(control);
  }

  static validateForXmlContent(control: AbstractControl) {
    if (!control || !control.value) {
      return null;
    }
    if (Validators.pattern('^[^<>\'"&]*$')(control)) {
      return {custom: {message: 'Введенное значение содержит недопустимые символы: < > \' " &'}};
    }
    return null;
  }

  /**
   * Обязательно для заполнения, если заполнен другой контрол
   * @param otherControlName
   */
  static requiredIf(otherControlName: string): ValidatorFn {
    return control => {
      if (!control || !otherControlName || !control.parent) {
        return null;
      }
      const otherControl = control.parent.get(otherControlName);
      return otherControl && otherControl.value ? Validators.required(control) : null;
    };
  }

  static clearServerSideValidationErrors(fieldName: string, fg: FormGroup, serverSideErrorsProvider: ServerSideErrorsProvider) {
    if (fg.get(fieldName).errors) {
      const index = serverSideErrorsProvider.serverSideValidationErrors.findIndex(error => error.fieldName === fieldName );
      if (index >= 0) {
        serverSideErrorsProvider.serverSideValidationErrors.splice(index, 1);
      }
    }
  }

  static onPercentChange($event, fieldName, fg) {
    const newValue = $event && !isNaN(+$event) ? (+$event) / 100 : $event;
    fg.get(fieldName).setValue(newValue);
    fg.get(fieldName + 'View').setValue($event);
    fg.markAsDirty();
  }
}
