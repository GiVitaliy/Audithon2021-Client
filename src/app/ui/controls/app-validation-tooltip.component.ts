import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-validation-tooltip',
  template: `<div *ngFor="let err of getErrorText(); let i = index">{{i + 1}}. {{err}}</div>`
})
export class AppValidationTooltipComponent {

  static noErrors = [];

  @HostBinding('attr.class') cls = 'tooltip-content';
  @Input() input;

  getErrorText() {
    if (!this.input || !this.input.errors) {
      return AppValidationTooltipComponent.noErrors;
    }

    const errorsObj = this.input.errors;
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
      } else if (propertyName === 'controlValue') {
        errors.push('Введенное значение не проходит проверку корректности');
      } else {
        errors.push(errorsObj[propertyName].message);
      }
    }
    return errors;
  }
}
