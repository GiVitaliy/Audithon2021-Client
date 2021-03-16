import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Observable } from 'rxjs/internal/Observable';
import { LookupSourceService } from '../../logic/services/lookup-source.service';

@Component({
  selector: 'app-ag-grid-lookup-renderer',
  template: `<span *ngIf="params && params.navigateAction" class="itech-link in-table-link" (click)="navigateAction()">{{ getLookup$() | async }}</span>
  <span *ngIf="params && !params.navigateAction">{{ getLookup$() | async }}</span>`
})
export class AgGridLookupRendererComponent implements ICellRendererAngularComp {

  constructor(private lookupService: LookupSourceService) {}

  public params: any;

  // called on init
  agInit(params: any): void {
    this.params = params;
  }

  // called when the cell is refreshed
  refresh(params: any): boolean {
    this.params = params;
    return true;
  }

  public getLookup$(): Observable<any> {
    // objId2 - составной второй ключ для лукапа, objId2FieldName это имя поля, где в данных хранится ключ
    const objId2 = this.params.objId2FieldName ? this.params.data[this.params.objId2FieldName] : null;
    return this.lookupService.getLookupCaption(this.params.value, this.params.lookupName, this.params.useShort, objId2);
  }

  navigateAction() {
    if (this.params.navigateAction) {
      const objId2 = this.params.objId2FieldName ? this.params.data[this.params.objId2FieldName] : null;
      this.params.navigateAction(this.params.value, objId2);
    }
  }
}
