import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-choose-tree-nodes',
  template: `
    <ng-container *ngIf="parent">
      <clr-tree-node *ngFor='let item of parent.children'>
        <button class="clr-treenode-link" [class.active]="item.selected && item.isForSelect" (click)="onClick(item)">
          <clr-icon shape="folder" *ngIf="item.children && item.children.length > 0" size="16"></clr-icon>
          <clr-icon shape="success-standard" style="color: green" *ngIf="!item.children || !item.children.length"
                    class="is-solid" size="16"></clr-icon>
          <span *ngIf="item.warningText" style="font-size: 12px; cursor: pointer; color: red">
            [{{item.warningText}}]
          </span>
          <clr-icon shape="ruble" class="is-solid" style="color: green;margin-right: 2px" size="18"
                    *ngIf="item.forcedPayed"></clr-icon>
          <span style="font-size: 12px; cursor: pointer">
            {{item.caption}}
          </span>
        </button>
        <ng-template [(clrIfExpanded)]="item.expanded" *ngIf="item.children && item.children.length > 0">
          <app-choose-tree-nodes [parent]="item" (click)="onInnerClick($event)"></app-choose-tree-nodes>
        </ng-template>
      </clr-tree-node>
    </ng-container>
  `
})
export class AppChooseTreeNodesComponent {
  @Input() parent: any = { children: [] };
  @Output() click = new EventEmitter<any>();

  onInnerClick(item: any) {
    this.click.emit(item);
  }


  onClick(item: any) {
    item.expanded = !item.expanded;
    this.onInnerClick(item);
  }
}
