import { Component } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-ag-grid-checkbox-renderer',
  template: `<input type="checkbox" [checked]="params.value" (change)="onChange($event)">`
})
export class AgGridCheckboxRendererComponent implements ICellRendererAngularComp {

  public params: ICellRendererParams;

  constructor() { }

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  public onChange(event) {
    this.params.data.value[this.params.colDef.field] = event.currentTarget.checked;
  }

  refresh(params: ICellRendererParams): boolean {
    return true;
  }
}
