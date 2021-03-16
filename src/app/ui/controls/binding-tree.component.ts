import {
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy, Output,
  SimpleChanges,
} from '@angular/core';
import {LookupSourceService} from '../../logic/services/lookup-source.service';
import { AppTreeNode, AppTreeNodeRoot } from './app-tree.component';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ClrSelectedState } from '@clr/angular';
import { Subscription } from 'rxjs/internal/Subscription';

export abstract class BindingTreeComponent implements OnChanges, OnDestroy {
  // контрол работает в двух режимах:
  // 1) указываем на входе inputFormGroup и inputControlName, тогда привязываемся // к формгруппе и обновляем значения там.
  // 2) Иначе на вход дать selectedIds, тогда необходимо подписаться на событие onSelectedChanged
  // и обновлять формгруппу, если необходимо

  @Output() selectedChanged: EventEmitter<any> = new EventEmitter<any>();
  @Input() inputFormGroup: FormGroup;
  @Input() inputControlName: string;

  groupTree: AppTreeNodeRoot;
  bingingActive = false;
  arraySubscription: Subscription;

  private _boundArray: FormArray;

  get boundArray(): FormArray {
    return this._boundArray;
  }

  set boundArray(value: FormArray) {
    if (this._boundArray !== value) {
      this._boundArray = value;
      this.selectedIds = value ? value.value : [];
    }
  }

  private _selectedIds: number[];
  @Input() get selectedIds() {
    return this._selectedIds;
  }

  set selectedIds(value: number[]) {
    if (value !== this._selectedIds) {
      this._selectedIds = value;
      if (this.groupTree) {
        setTimeout(() => {
          try {
            this.bingingActive = true;
            this.groupTree.allChildren.forEach((node: AppTreeNode) => {
              if (!node.isFolder) {
                node.setSelected(value.indexOf(node['id']) !== -1);
              }
            });
          } finally {
            this.bingingActive = false;
          }
        });
      }
    }
  }

  protected constructor(protected lookupService: LookupSourceService,
              protected fb: FormBuilder) {
  }

  // метод для дополнительных изменений при простановке галок
  abstract extraSelectedChange(event);

  onSelectedChanged(event: any) {
    // событие вызываеть только если не происходит set selectedIds
    // чтобы не запускать рекурсивное присвоение
    if (!this.bingingActive) {
      this.bindedFormGroupChanged(event);
      this.selectedChanged.emit(event);
      this.extraSelectedChange(event);
    }
  }

  bindedFormGroupChanged(event: any) {
    if (!this.inputFormGroup || !this.inputControlName) {
      return;
    }

    if (!event.isFolder) {
      if (event.selected === ClrSelectedState.SELECTED) {
        const index = (this.inputFormGroup.get(this.inputControlName) as FormArray).controls.findIndex(item => item.value === event['id']);
        // добавляю, только если такого ИД нет
        if (index < 0) {
          (this.inputFormGroup.get(this.inputControlName) as FormArray).push(this.fb.control(event['id']));
        }
      }
      if (event.selected === ClrSelectedState.UNSELECTED) {
        const index = (this.inputFormGroup.get(this.inputControlName) as FormArray).controls.findIndex(item => item.value === event['id']);
        (this.inputFormGroup.get(this.inputControlName) as FormArray).removeAt(index);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // если изменились inputFormGroup или inputControlName и установлен inputFormGroup, то необходимо подписаться на
    // изменения inputFormGroup, т.к. ссылка на контрол boundArray может измениться при setValue
    if ((changes.hasOwnProperty('inputControlName') || changes.hasOwnProperty('inputFormGroup')) && this.inputFormGroup) {
      this.boundArray = this.inputFormGroup ? this.inputFormGroup.get(this.inputControlName) as FormArray : undefined;

      if (this.arraySubscription) {
        this.arraySubscription.unsubscribe();
      }

      this.arraySubscription = this.inputFormGroup.valueChanges.subscribe(value => {
        // пока реагируем на все изменения inputFormGroup, т.к. выделить отдельно изменение FormArray для boundArray нельзя
        this.boundArray = this.inputFormGroup ? this.inputFormGroup.get(this.inputControlName) as FormArray : undefined;
      });
    }
  }

  ngOnDestroy() {
    if (this.arraySubscription) {
      this.arraySubscription.unsubscribe();
    }
  }
}
