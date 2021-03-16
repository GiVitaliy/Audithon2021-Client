import { Component, EventEmitter, Input, Output } from '@angular/core';
import {isUndefined} from 'util';
import {ClrSelectedState} from '@clr/angular';

/** @deprecated Use the App-Tree */
@Component({
  selector: 'app-tree-nodes',
  template: `
    <ng-container [clrLoading]='loading' *ngIf="parent">
      <clr-tree-node *ngFor='let item of parent.children' [clrSelected]="item.selected"
                     (clrSelectedChange)="changeSelectedChildItems(item, $event)">
        {{item.caption}}
        <ng-template [(clrIfExpanded)]="item.expanded" *ngIf="item.children && item.children.length > 0">
          <app-tree-nodes [parent]="item" (selectedChange)="selectedChange.emit($event)"></app-tree-nodes>
        </ng-template>
      </clr-tree-node>
    </ng-container>
  `
})
export class AppTreeNodesComponent {
  loading = false;

  private _parent: any = { children: [], expanded: false};

  @Output() selectedChange = new EventEmitter();

  @Input()
  get parent(): any {
    return this._parent;
  }

  set parent(node) {
    if (this._parent !== node) {
      if (node && isUndefined(node['expanded'])) {
        node.expanded = false;
      }

      this.initSelectedRecursive(node);

      this._parent = node;
    }
  }

  public static selectedToState(selected: boolean): ClrSelectedState {
    return selected ? ClrSelectedState.SELECTED : ClrSelectedState.UNSELECTED;
  }

  public static setSelectedChildItems(parent, selected) {
    if (parent.children) {
      parent.children.forEach(child => {
        child.selected = selected;
        AppTreeNodesComponent.setSelectedChildItems(child, selected);
      });
    }
  }

  getSelectedLeafes(): any[] {
    const selected = [];
    this.fillSelectedLeafs(this.parent, selected);
    return selected;
  }

  private initSelectedRecursive(node: any) {
    if (isUndefined(node['selected'])) {
      node['selected'] = 0;
      if (node.expanded && node.children) {
        node.children.forEach((child => {
          this.initSelectedRecursive(child);
        }));
      }
    }
  }

  private fillSelectedLeafs(node: any, selected: any[], hasSelectedParent: boolean = false) {
    const nodeIsLeaf = !node.children || node.children.length <= 0;
    const nodeIsSelected = hasSelectedParent
      || (typeof node.selected === 'boolean' && node.selected)
      || node.selected === ClrSelectedState.SELECTED;
    if (nodeIsLeaf) {
      if (nodeIsSelected || hasSelectedParent) {
        selected.push(node);
      }
    } else {
      node.children.forEach(item => this.fillSelectedLeafs(item, selected, nodeIsSelected || hasSelectedParent));
    }
  }

  // fix: Если в модели узла дерева проинициализировано своейство selected, то дерево некорректно работает
  // при разворачивании: оно начинает менять состояние выбранности узлов верхнего уровня при подгрузке
  // дочерних элементов со свойством selected
  changeSelectedChildItems(parent, selected) {
    if (parent.selected === selected) { return; }
    parent.selected = selected;
    this.selectedChange.emit(selected);

    // AppTreeNodesComponent.setSelectedChildItems(parent, selected);
  }
}
