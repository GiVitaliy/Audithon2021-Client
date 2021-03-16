import {AfterViewInit, Component, Injectable, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ICellEditorAngularComp} from 'ag-grid-angular';
import {Observable} from 'rxjs/internal/Observable';

@Component({
  selector: 'app-grid-number-editor',
  templateUrl: './app-grid-number-editor.component.html',
  styles: [`select {
  max-width: 100%;
  width: 100%;
  height: 100% !important;
}`]
})
export class AppGridNumberEditorComponent implements ICellEditorAngularComp, AfterViewInit {
  private params: any;
  public value: number;
  public maxValue: number;
  public minValue: number;

  @ViewChild('input', {read: ViewContainerRef}) public input: ViewContainerRef;


  agInit(params: any): void {
    this.params = params;
    this.value = this.params.value;
    if (params.options) {
      this.minValue = params.options.minValue;
      this.maxValue = params.options.maxValue;
    }
  }

  getValue(): any {
    return this.value;
  }

  ngAfterViewInit() {
    window.setTimeout(() => {
      this.input.element.nativeElement.focus();
    }, 100);
  }
}
