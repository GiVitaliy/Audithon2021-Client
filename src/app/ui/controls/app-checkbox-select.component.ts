import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LookupSourceService } from '../../logic/services/lookup-source.service';
import { FormArray, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-checkbox-select',
  template: `
    <div *ngFor="let item of items; index as i" class="checkbox itech-no-margins"
         [class.disabled]="disabled">
      <input type="checkbox" id="check{{i}}_{{rndToken}}" [disabled]="disabled" [(ngModel)]="item.checked"
             (change)="updateContextFormGroup()">
      <label for="check{{i}}_{{rndToken}}" title="{{item.data.caption}}">{{item.data.caption}}</label>
    </div>
  `
})
export class AppCheckboxSelectComponent implements OnChanges {
  @Input() disabled;
  @Input() contextControlName;
  @Input() contextFormGroup;
  @Input() sorted = false;
  @Input() lookupName: string;
  // инпут для проставки или снятия всех галок
  @Input() checkAll = false;
  @Input() customLookupItems: any[];

  items = [];
  itemsLookup = {};
  rndToken = Math.floor(Math.random() * 1000000);

  loadedLookupSorted: string;

  constructor(private lookupSourceService: LookupSourceService,
              private fb: FormBuilder) {
  }

  get boundArray(): FormArray {
    return this.contextFormGroup.get(this.contextControlName) as FormArray;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.lookupName && this.loadedLookupSorted !== this.lookupName + ':' + this.sorted) {
      this.loadedLookupSorted = this.lookupName + ':' + this.sorted;
      this.lookupSourceService.getLookup(this.lookupName).subscribe(lookupContent => {
        this.bindInternal(lookupContent);
      });
    }

    if (!this.lookupName && changes.hasOwnProperty('customLookupItems')) {
      this.bindInternal(this.customLookupItems);
    }

    if (changes.hasOwnProperty('contextFormGroup') || changes.hasOwnProperty('contextControlName')) {
      if (this.contextFormGroup && this.contextControlName) {
        this.updateItemsCheckedState();

        this.boundArray.valueChanges.subscribe(() => {
          this.updateItemsCheckedState();
        });
      }
    }

    if (changes.hasOwnProperty('checkAll')) {
      this.items.forEach(item => {
        item.checked = this.checkAll;
      });
      this.updateContextFormGroup();
    }
  }

  private bindInternal(lookupContent: any[]) {
    lookupContent = lookupContent || [];
    if (!this.sorted) {
      lookupContent.sort((item1, item2) => item1.id - item2.id);
    } else {
      lookupContent.sort((item1, item2) => item1.caption ? item1.caption.localeCompare(item2.caption) : 0);
    }
    this.itemsLookup = {};
    this.items = lookupContent.map(el => {
      const item = { data: el, checked: false };
      this.itemsLookup[el.id] = item;
      return item;
    });
    this.updateItemsCheckedState();
  }

  private updateItemsCheckedState() {
    this.items.forEach(el => {
      el.checked = false;
    });
    this.boundArray.controls.forEach(ctrl => {
      const item = this.itemsLookup[ctrl.value];
      if (item) {
        item.checked = true;
      }
    });
  }

  updateContextFormGroup() {
    const selectedItems = [];
    this.items.forEach(el => {
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
