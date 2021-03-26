import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-checkbox-items',
  template: `
    <ng-container *ngIf="preparedItems">
      <div *ngFor="let item of preparedItems; index as i" class="checkbox itech-no-margins"
           [class.disabled]="disabled">
        <input type="checkbox" id="check{{i}}_{{rndToken}}" [disabled]="disabled" [(ngModel)]="item.checked"
               (change)="updateContextFormGroup()">
        <label for="check{{i}}_{{rndToken}}">{{item.data.caption}}</label>
        <clr-tooltip *ngIf="warningItemsMap && warningItemsMap[item.data.id.toString()]">
          <clr-icon clrTooltipTrigger shape="info-circle" size="24" class="is-warning"></clr-icon>
          <clr-tooltip-content clrPosition="top-right" clrSize="lg" *clrIfOpen>
            <span>{{ warningItemsMap[item.data.id.toString()] }}</span>
          </clr-tooltip-content>
        </clr-tooltip>
      </div>
      <div class="no-row-message" *ngIf="preparedItems.length === 0">{{noRowsMessage}}</div>
    </ng-container>  `,
  styles: [`.no-row-message {
  height: 36px; 
  display: table-cell;
  vertical-align: middle;
  }`]
})
export class AppCheckboxItemsComponent implements OnChanges {
  @Input() disabled;
  @Input() contextControlName;
  @Input() contextFormGroup;
  @Input() warningItemsMap: any;
  @Input() noRowsMessage: string;

  preparedItems: any[];
  preparedItemsMap: any;
  rndToken = Math.floor(Math.random() * 1000000);

  private _items: any[];
  @Input()
  get items(): any[] {
    return this._items;
  }

  set items(value: any[]) {
    if (this._items !== value) {
      this._items = value;
      this.preparedItems = this.prepareItems(value);
    }
  }

  prepareItems(value: any[]): any[] {
    if (!value) {
      return [];
    }
    const itemsMap = {};
    const items = value.map(el => {
      const item = { data: el, checked: false };
      itemsMap[el.id] = item;
      return item;
    });
    this.updateItemsCheckedState(itemsMap, items);

    this.preparedItemsMap = itemsMap;
    return items;
  }

  constructor(private fb: FormBuilder) {
  }

  get boundArray(): FormArray {
    return this.contextFormGroup.get(this.contextControlName) as FormArray;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.boundArray && (changes.hasOwnProperty('contextFormGroup') || changes.hasOwnProperty('contextControlName'))) {
      if (this.contextFormGroup && this.contextControlName) {
        this.updateItemsCheckedState(this.preparedItemsMap, this.preparedItems);

        this.boundArray.valueChanges.subscribe(() => {
          this.updateItemsCheckedState(this.preparedItemsMap, this.preparedItems);
        });
      }
    }
  }

  private updateItemsCheckedState(itemsMap: any, items: any[]) {
    if (!items || !itemsMap) {
      return;
    }

    items.forEach(el => {
      el.checked = false;
    });
    if (this.boundArray && this.boundArray.controls) {
      this.boundArray.controls.forEach(ctrl => {
        const item = itemsMap[ctrl.value];
        if (item) {
          item.checked = true;
        }
      });
    }
  }

  updateContextFormGroup() {
    const selectedItems = [];
    this.preparedItems.forEach(el => {
      if (el.checked) {
        selectedItems.push(this.fb.control(el.data.id));
      }
    });

    while (this.boundArray.length > 0) {
      this.boundArray.removeAt(0);
    }
    selectedItems.forEach(el => this.boundArray.push(el));
    this.boundArray.markAsDirty();
  }

}
