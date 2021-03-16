import {Component} from '@angular/core';
import {Observable, of} from 'rxjs/index';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IModalBody, ModalResult} from '../../logic/services/app-navigation.service.models';
import {FormHelper} from './form-helper';

@Component({
  selector: 'app-select-items-modal',
  template: `
    <div class="form compact" [formGroup]="contextFormGroup">
      <section class="form-block itech-block-normal">
        <div class="form-group">
          <label for="person-group-visibility" class="required">{{lookupTitle}}</label>
          <app-combo-lookup class="itech-control-medium"
                            [contextControlId]="'id'"
                            [contextControlName]="'id'"
                            [lookupItems]="lookupItems"
                            [disabledChoices]="disabledChoices"
                            [contextFormGroup]="contextFormGroup"></app-combo-lookup>
        </div>
      </section>
    </div>
  `
})

export class ModalSelectItemsComponent implements IModalBody<any, any> {

  contextFormGroup: FormGroup;
  lookupItems = [];
  lookupTitle = 'Вид';
  disabledChoices = [];

  constructor(private fb: FormBuilder) {}

  isInvalid(controlName: string): boolean {
    return FormHelper.isInvalid(this.contextFormGroup, controlName);
  }

  initModalBody(data: any) {
    this.lookupItems = data.lookupItems;
    this.disabledChoices = data.disabledChoices;
    this.lookupTitle = data.lookupTitle;
    this.contextFormGroup = this.fb.group({
      id: ['', Validators.required],
    });

  }

  onModalAccept$(): Observable<ModalResult<any>> {
    if (this.contextFormGroup && !this.contextFormGroup.valid) {
      return of(new ModalResult(false, null));
    }

    return of(new ModalResult(true, this.contextFormGroup.value));
  }
}
