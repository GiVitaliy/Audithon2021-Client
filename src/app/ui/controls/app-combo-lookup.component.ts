import { Component, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LookupSourceService } from '../../logic/services/lookup-source.service';
import { FormHelper } from './form-helper';
import { Subject } from 'rxjs';
import { map } from 'rxjs/internal/operators';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {Observable} from 'rxjs/internal/Observable';
import {of} from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-combo-lookup',
  templateUrl: './app-combo-lookup.component.html'
})
export class AppComboLookupComponent implements OnChanges {
  @Input() contextControlName;
  @Input() contextFormGroup;
  @Input() validationTooltipRight = false;
  @Input() validationTooltipTopLeft = false;
  @Input() validationTooltipBottomLeft = false;
  @Input() validationTooltipBottomRight = false;
  @Input() contextControlId;
  @Input() disabled = false;
  @Input() disabledChoices = [];
  @Output() change = new Subject<any>();
  @Input() sorted = false;
  @Input() required = true;

  @Input() lookupItems: any[] = [];

  focused = false;
  hovered = false;

  bonusDeletedItem: any;

  private _lookupName: string;
  @Input()
  get lookupName(): string {
    return this._lookupName;
  }

  get boundControl(): FormControl {

    if (!this.contextFormGroup) {
      return undefined;
    }

    return this.contextFormGroup instanceof FormArray
      ? this.contextFormGroup.controls[this.contextControlName]
      : this.contextFormGroup.get(this.contextControlName);
  }

  set lookupName(newLookupName) {
    if (this._lookupName !== newLookupName && newLookupName) {
      this._lookupName = newLookupName;
      this.initLookupItems();
    }
  }

  get controlIsDisabled(): boolean {
    return this.boundControl && this.boundControl.disabled;
  }

  constructor(private lookupSourceService: LookupSourceService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.hasOwnProperty('lookupName') || changes.hasOwnProperty('contextFormGroup')
        || changes.hasOwnProperty('contextControlName')) && this.boundControl) {
      // вот это все нам нужно, чтобы отследить, что присваивается контролу, и добавить в список удаленный элемент,
      // которого еще в списке нету (чтобы корректно отображались ранее выбранные удаленные элементы, и при этом список
      // не содержал всех удаленных элементов)
      this.boundControl.valueChanges.subscribe(() => {
        this.tryUpdateBonusDeletedItem();
      });
      this.tryUpdateBonusDeletedItem();
    }
  }

  private tryUpdateBonusDeletedItem() {
    if (!this.lookupName) {
      return;
    }

    this.lookupSourceService.getLookupObj(this.lookupName).subscribe((lookup: any[]) => {
      const newVal = this.boundControl.value;
      if (newVal && !this.lookupItems.find(el => el.id == newVal)) {
        this.bonusDeletedItem = lookup['Obj' + newVal];
      } else {
        this.bonusDeletedItem = undefined;
      }
    });
  }

  initLookupItems() {
    this.getLookup().subscribe((items) => {
      this.lookupItems = items;

      this.tryUpdateBonusDeletedItem();
    });
  }

  isDisabledChoice(val: any) {
    if (!this.disabledChoices) {
      return false;
    }

    return (this.disabledChoices.find(item => item == val) >= 0);
  }

  focus() {
    this.focused = true;
  }

  blur() {
    this.focused = false;
  }

  getLookup() {
    return this.lookupSourceService.getLookup(this.lookupName).pipe(map(lookup => {
      if (!this.sorted) {
        lookup.sort((item1, item2) => item1.id - item2.id);
      } else {
        lookup.sort((item1, item2) => item1.caption ? item1.caption.localeCompare(item2.caption) : 0);
      }

      return lookup;
    }));
  }

  isInvalid(cname: string) {
    return FormHelper.isInvalid(this.contextFormGroup, cname);
  }

  clearValue() {
    this.contextFormGroup.controls[this.contextControlName].setValue(undefined);
    this.contextFormGroup.controls[this.contextControlName].markAsDirty();
    this.change.next({});
  }

  hover() {
    this.hovered = true;
  }

  hoverEnd() {
    this.hovered = false;
  }

  onChange(event: Event) {
    const s = event.target as HTMLSelectElement;
    if (s.value) {
      this.change.next(this.lookupItems.find(x => x.id.toString() === s.value));
    } else {
      this.change.next({});
    }
    event.stopPropagation();
  }

  getItemCaption(): Observable<string> {
    if (!this.lookupName && this.contextFormGroup.get(this.contextControlName.toString()).value) {
      const itemId = this.contextFormGroup.get(this.contextControlName.toString()).value;
      return of(this.lookupItems.find(val => val.id == itemId).caption);
    } else if (this.lookupName && this.contextControlName) {
      return this.lookupSourceService.getLookupCaption(this.contextFormGroup.get(this.contextControlName.toString()).value, this.lookupName);
    }
    return of('');
  }
}
