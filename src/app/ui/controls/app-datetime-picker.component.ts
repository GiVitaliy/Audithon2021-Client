import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { StringHelper } from '../../helpers/string-helper';
import { FormHelper } from './form-helper';

@Component({
  selector: 'app-datetime-picker',
  template: `
    <label for="{{contextControlName}}Date" aria-haspopup="true" role="tooltip"
           class="tooltip tooltip-validation tooltip-md {{tooltipClass}}"
           [class.invalid]="isInvalid(contextControlName)">
      <input #datePortion type="date" id="{{contextControlName}}Date" required
             (change)="datePortionControlChanged($event)">
      <app-validation-tooltip [input]="contextFormGroup.controls[contextControlName]"></app-validation-tooltip>
      <input #timePortion type="time" id="{{contextControlName}}Time" required
             (change)="timePortionControlChanged($event)">
      <app-validation-tooltip [input]="contextFormGroup.controls[contextControlName]"></app-validation-tooltip>
      <button type="button" class="btn btn-danger btn-link itech-inline-tool-btn" title="Очистить"
              (click)="eraseCtrl()" *ngIf="!required">
        <clr-icon shape="eraser"></clr-icon>
      </button>
    </label>
  `
})
export class AppDatetimePickerComponent implements OnChanges {
  @Input() required = true;
  @Input() disabled;
  @Input() contextControlName;
  @Input() contextFormGroup;
  @Input() tooltipClass = 'tooltip-right';

  @ViewChild('datePortion') datePortion: ElementRef;
  @ViewChild('timePortion') timePortion: ElementRef;

  ignoreNextChangesCount = 0;

  boundContextFormGroup: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('contextFormGroup') || changes.hasOwnProperty('contextControlName')) {

      if (this.contextFormGroup && this.contextControlName && this.contextFormGroup !== this.boundContextFormGroup) {

        this.contextFormGroup.get(this.contextControlName).valueChanges.subscribe(val => {

          if (this.ignoreNextChangesCount) {

            this.ignoreNextChangesCount--;

          } else if (val === this.contextFormGroup.get(this.contextControlName).value) {
            // проверка val === this.contextFormGroup.get(this.contextControlName).value
            // костыль - чтобы исключить обновление даты, при обновлении обращения, которое запускает также обновление связанных обращений
            // (родительского или дополнений). При этом в дате отобразится последнее сохраняемое связанное обращение.
            // ранее воспроизводилось: открываем главное обращение, открываем дополнение, изменяем дополнение, сохраняем.
            // При этом запускалось обновление родительского обращения - и в дополнении отображалась дата родительского обращения.
            // В модели и на форме при этом хранится корректная дата - только в nativeElement получается последняя измененная дата.
            if (!val || val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}\w*/)) {
              this.datePortion.nativeElement.value = StringHelper.getDatePortionOfISODate(val);
              this.timePortion.nativeElement.value = StringHelper.getTimePortionOfISODate(val);
            }
          }
        });
        this.contextFormGroup.get(this.contextControlName).setValue(this.contextFormGroup.get(this.contextControlName).value);

        this.boundContextFormGroup = this.contextFormGroup;
      }
    }
  }

  datePortionControlChanged($event: any) {
    const newValue = $event.target.value + 'T'
      + StringHelper.getTimePortionOfISODate(this.contextFormGroup.get(this.contextControlName).value);

    if (this.contextFormGroup.get(this.contextControlName).value !== newValue) {
      this.ignoreNextChangesCount++;
      setTimeout(() => {
        this.ignoreNextChangesCount = 0;
      }, 500);

      this.contextFormGroup.get(this.contextControlName).setValue(newValue);
      this.contextFormGroup.markAsDirty();
    }
  }

  timePortionControlChanged($event: any) {
    const newValue = StringHelper.getDatePortionOfISODate(this.contextFormGroup.get(this.contextControlName).value) +
      'T' + $event.target.value;

    if (this.contextFormGroup.get(this.contextControlName).value !== newValue) {
      this.ignoreNextChangesCount++;
      setTimeout(() => {
        this.ignoreNextChangesCount = 0;
      }, 500);

      this.contextFormGroup.get(this.contextControlName).setValue(newValue);
      this.contextFormGroup.markAsDirty();
    }
  }

  isInvalid(cname: string) {
    return FormHelper.isInvalid(this.contextFormGroup, cname);
  }

  eraseCtrl() {
    this.contextFormGroup.get(this.contextControlName).reset();
    this.contextFormGroup.get(this.contextControlName).markAsDirty();
  }
}
