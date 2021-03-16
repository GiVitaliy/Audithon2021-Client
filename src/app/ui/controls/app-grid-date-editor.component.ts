import {AfterViewInit, Component, Injectable, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ICellEditorAngularComp} from 'ag-grid-angular';
import {Observable} from 'rxjs/internal/Observable';
import {FormBuilder, FormGroup} from '@angular/forms';
import {FormHelper} from './form-helper';

@Component({
  selector: 'app-grid-date-editor',
  templateUrl: './app-grid-date-editor.component.html',
  styles: [`input {
  max-width: 100%;
  width: 100%;
  height: 100% !important;
}`, `div {
    height: 100%;
  }`]
})
export class AppGridDateEditorComponent implements ICellEditorAngularComp, AfterViewInit {
  private params: any;
  formGroup: FormGroup;

  @ViewChild('input', {read: ViewContainerRef}) public input: ViewContainerRef;

  constructor(private fb: FormBuilder) {}

  agInit(params: any): void {
    this.params = params;
    this.formGroup = this.fb.group({
      date: [params.value, FormHelper.validateDateTimePicker()]
    });

    const model = {
      date: params.value
    };
    this.formGroup.patchValue(model);
  }

  getValue(): any {
    return this.formGroup.get('date').value;
  }

  ngAfterViewInit() {
    window.setTimeout(() => {
      this.input.element.nativeElement.focus();
    }, 100);
  }

  keyDown($event) {
    if ($event['code'] && ($event['code'] === 'Delete' || $event['code'] === 'Backspace')) {
      this.formGroup.get('date').setValue(null);
      return;
    }
    if ($event['keyCode'] && ($event['keyCode'] === 8 || $event['keyCode'] === 46) ) {
      this.formGroup.get('date').setValue(null);
      return;
    }
  }

  convertToDate(date: any) {
    return new Date(date);
  }

}
