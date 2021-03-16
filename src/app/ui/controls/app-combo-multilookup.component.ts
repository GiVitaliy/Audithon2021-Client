import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-combo-multilookup',
  template: `
    <ng-container *ngFor="let item of boundArray.controls; index as i">
      <div class="form-group">
        <label for="{{contextControlName + i}}">
          {{itemTitle + ' №' + (i + 1).toString()}}
        </label>
        <app-text-lookup *ngIf="viewMode === 'text-lookup'" [contextControlId]="contextControlName + i"
                         [contextControlName]="i" [required]="false"
                         [lookupName]="lookupName" [sorted]="sorted" [disabled]="disabled"
                         [contextFormGroup]="boundArray"></app-text-lookup>
        <app-combo-lookup *ngIf="viewMode === 'combo-lookup'" [contextControlId]="contextControlName + i"
                         [contextControlName]="i" [required]="false"
                         [lookupName]="lookupName" [sorted]="sorted" [disabled]="disabled"
                         [contextFormGroup]="boundArray"></app-combo-lookup>
      </div>
    </ng-container>
    <div class="form-group">
      <label for="{{contextControlName + 'N'}}">
        {{itemTitle + ' №' + (boundArray.controls.length + 1).toString()}}
      </label>
      <app-text-lookup *ngIf="viewMode === 'text-lookup'" [contextControlId]="contextControlName + 'N'"
                       [contextControlName]="'value'" [required]="false"
                       [lookupName]="lookupName" [sorted]="sorted" [disabled]="disabled"
                       [contextFormGroup]="emptyElementForm"></app-text-lookup>
      <app-combo-lookup *ngIf="viewMode === 'combo-lookup'" [contextControlId]="contextControlName + 'N'"
                       [contextControlName]="'value'" [required]="false"
                       [lookupName]="lookupName" [sorted]="sorted" [disabled]="disabled"
                       [contextFormGroup]="emptyElementForm"></app-combo-lookup>
    </div>
  `
})
export class AppComboMultilookupComponent implements OnChanges {
  @Input() disabled;
  @Input() contextControlName;
  @Input() contextFormGroup;
  @Input() sorted = false;
  @Input() lookupName: string;
  @Input() itemTitle = 'Выбор';
  // в зависимости от параметра отображать app-text-lookup или app-combo-lookup
  @Input() viewMode = 'text-lookup';

  emptyElementForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.emptyElementForm = fb.group({
      value: ''
    });

    this.emptyElementForm.valueChanges.subscribe(() => {
      if (this.emptyElementForm.get('value').value || this.emptyElementForm.get('value').value === 0) {
        setTimeout(() => {
          this.boundArray.push(this.fb.control(this.emptyElementForm.get('value').value));
          this.boundArray.markAsDirty();
          this.emptyElementForm.get('value').setValue(undefined);
        }, 100);
      }
    });
  }

  get boundArray(): FormArray {
    return this.contextFormGroup.get(this.contextControlName) as FormArray;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('contextFormGroup') || changes.hasOwnProperty('contextControlName')) {
      if (this.contextFormGroup && this.contextControlName) {

        this.boundArray.valueChanges.subscribe(() => {
          this.prettifyBoundArray();
        });
        this.prettifyBoundArray();
      }
    }
  }

  private prettifyBoundArray() {
    setTimeout(() => {
      let i = 0;
      while (i < this.boundArray.length) {
        if (!this.boundArray.controls[i].value && this.boundArray.controls[i].value !== 0) {
          this.boundArray.removeAt(i);
          this.boundArray.markAsDirty();
        } else {
          i++;
        }
      }
    }, 100);
  }
}
