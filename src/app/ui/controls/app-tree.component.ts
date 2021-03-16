import { Component, EventEmitter, Input, Output } from '@angular/core';
import {isUndefined} from 'util';
import {ClrSelectedState} from '@clr/angular';

export class AppTreeNode {
  caption: string;
  children: AppTreeNode[];
  expanded: boolean;
  private _root: AppTreeNodeRoot;
  private _parent: AppTreeNode;
  private _selected: ClrSelectedState;

  constructor(root: AppTreeNodeRoot,
              parent: AppTreeNode,
              dataOrCaption: string | any,
              expanded: boolean,
              selected: boolean) {
    if (typeof dataOrCaption === 'string') {
      this.caption = dataOrCaption as string;
    } else if (dataOrCaption) {
      Object.assign(this, dataOrCaption);
      this.caption = dataOrCaption['caption'] ? dataOrCaption['caption'] : 'Наименование не определено';
    } else {
      this.caption = '';
    }

    this.children = [];
    this.expanded = !!expanded;

    this._root = root;
    this.parent = parent;
    this.setSelected(selected);

    if (this._root) {
      this._root.registerChild(this);
    }
  }

  get selected(): ClrSelectedState {
    return this._selected;
  }

  set selected(value: ClrSelectedState) {
    if (value !== this._selected) {
      this._selected = value;
      if (this._root && !this._root.silent) {
        this._root.changed.emit(this);
      }
    }
  }

  get parent(): AppTreeNode {
    return this._parent;
  }

  set parent(value: AppTreeNode) {
    if (value !== this._parent) {
      if (this._parent) {
        this.parent.removeChild(this);
      }

      this._parent = value;
      if (this._parent) {
        this._parent.addChild(this);
      }
    }
  }

  get isFolder(): boolean {
    return this.children && this.children.length > 0;
  }

  isCheckedNode(): boolean {
    return this.selected === ClrSelectedState.SELECTED;
  }

  setSelected(selected: boolean) {
    if (this.internalSetSelected(selected) && this.parent) {
      this.parent.internalUpdateSelectedStateRecursiveUp();
    }
  }

  expandParents() {
    if (this.parent) {
      this.parent.expand();
      this.parent.expandParents();
    }
  }

  expand() {
    this.expanded = true;
  }

  collapse() {
    this.expanded = false;
  }

  newChild(dataOrCaption: string | any, expanded: boolean, selected: boolean): AppTreeNode {
    return new AppTreeNode(this._root, this, dataOrCaption, expanded, selected);
  }

  private addChild(child: AppTreeNode) {
    if (!this.children) { this.children = []; }

    const index = this.children.indexOf(child, 0);
    if (index < 0) {
      this.children.push(child);
      if (child.selected !== this.selected) {
        this.internalUpdateSelectedStateRecursiveUp();
      }
    }
  }

  private removeChild(child: AppTreeNode) {
    if (this.children) {
      const index = this.children.indexOf(child, 0);
      if (index > -1) {
        this.children.splice(index, 1);
        this.internalUpdateSelectedStateRecursiveUp();
      }
    }
  }

  private internalUpdateSelectedStateRecursiveUp() {
    const newState = this.calculateSelectedFolderState();
    if (this.selected !== newState) {
      this.selected = newState;
      if (this.parent) {
        this.parent.internalUpdateSelectedStateRecursiveUp();
      }
    }
  }

  private internalSetSelected(selected: boolean): boolean {
    const newSelected = selected ? ClrSelectedState.SELECTED
      : (this.isFolder ? this.calculateSelectedFolderState() : ClrSelectedState.UNSELECTED);

    if (this.selected !== newSelected) {
      this.selected = newSelected;
      return true;
    }

    return false;
  }

  private calculateSelectedFolderState(): ClrSelectedState {
    const selectedWeight = this.getSelectedChildrenWeight();
    const allSelected = selectedWeight > 0 && selectedWeight === this.children.length;
    const nothingSelected = 0 === selectedWeight;

    return nothingSelected ? ClrSelectedState.UNSELECTED : allSelected ? ClrSelectedState.SELECTED : ClrSelectedState.INDETERMINATE;
  }

  private getSelectedChildrenWeight(): number {
    let weight = 0;
    if (this.children) {
      for (let i = 0; i < this.children.length; i ++) {
        if (this.children[i].selected === ClrSelectedState.SELECTED) {
          weight++;
        }
        if (this.children[i].selected === ClrSelectedState.INDETERMINATE) {
          weight = weight + 0.5;
        }
      }
    }

    return weight;
  }
}

export class AppLookupListResult {
  constructor(public map: any,
    public root: AppTreeNodeRoot,
    private idSupplier: (item: any) => string) {
  }

  removeNode(node: AppTreeNode) {
    this.root.removeNode(node);
    delete this.map[this.idSupplier(node)];
  }
}

export class AppTreeNodeRoot extends AppTreeNode {
  changed: EventEmitter<AppTreeNode> = new EventEmitter<AppTreeNode>();
  allChildren: AppTreeNode[] = [];
  silent: boolean;

  constructor(dataOrCaption: string | any,
              expanded: boolean,
              selected: boolean) {
    super(null, null, dataOrCaption, expanded, selected);
  }

  static ofLookupList(items: any[],
                        idSupplier: (item: any) => string,
                        parentIdSupplier: (item: any) => string,
                        rootCaption: string,
                        rootExpanded: boolean): AppLookupListResult {
    const treeLookup: any = {};
    treeLookup['zz'] = new AppTreeNodeRoot(rootCaption, rootExpanded, false);

    items.forEach(item => {
      const itemId = idSupplier(item);
      const itemParentId = parentIdSupplier(item);

      if (!treeLookup[itemId]) {
        treeLookup[itemId] = new AppTreeNode(treeLookup['zz'], null, null, false, false);
      }
      Object.assign(treeLookup[itemId], item);

      const parentId = itemParentId ? itemParentId : 'zz';

      if (!treeLookup[parentId]) {
        treeLookup[parentId] = new AppTreeNode(treeLookup['zz'], null, null, false, false);
      }

      treeLookup[itemId].parent = treeLookup[parentId];
    });

    return new AppLookupListResult(treeLookup, treeLookup['zz'], idSupplier) ;
  }

  registerChild(child: AppTreeNode) {
    if (child) {
      this.allChildren.push(child);
    }
  }

  unselectAll() {
    this.selected = ClrSelectedState.UNSELECTED;
    this.allChildren.forEach((child) => child.selected = ClrSelectedState.UNSELECTED);
  }

  collapseAll() {
    this.collapse();
    this.allChildren.forEach((child) => child.collapse());
  }

  getSelectedLeafs(): AppTreeNode[] {
    const selected = [];
    this.internalFillSelectedLeafs(this, selected, true, false);
    return selected;
  }

  getSelectedNodes(): AppTreeNode[] {
    const selected = [];
    this.internalFillSelectedLeafs(this, selected, false, false);
    return selected;
  }

  removeNode(node: AppTreeNode) {
    if (!node) { return; }
    if (node.parent) {
      node.parent = null;
    }

    const index = this.allChildren.indexOf(node);
    if (index >= 0) {
      this.allChildren.splice(index, 1);
    }
  }

  private internalFillSelectedLeafs(node: AppTreeNode, selected: AppTreeNode[], onlyLeafs: boolean, hasSelectedParent: boolean = false) {
    const nodeIsLeaf = !node.children || node.children.length <= 0;
    const nodeIsSelected = hasSelectedParent || node.isCheckedNode();
    if (node !== this && (nodeIsLeaf || !onlyLeafs)) {
      if (nodeIsSelected) {
        selected.push(node);
      }
    }
    if (!nodeIsLeaf) {
      node.children.forEach(item => this.internalFillSelectedLeafs(item, selected, onlyLeafs, nodeIsSelected));
    }
  }
}


@Component({
  selector: 'app-tree',
  template: `
    <clr-tree [clrLazy]="true" *ngIf="root" class="itech-soc-services-tree">
      <clr-tree-node *clrRecursiveFor="let item of root; getChildren: getChildren"
                     [clrSelected]="item.selected"
                     [(clrExpanded)]="item.expanded" 
                     [clrExpandable]="isExpandable(item)"
                     (clrSelectedChange)="changeSelectedChildItems(item, $event)"
                     >
        {{item.caption}}
      </clr-tree-node>
    </clr-tree>
  `
})
export class AppTreeComponent {
  loading = false;// (clrExpandedChange)="changeExpanded(item, $event)"
  private _root;

  @Output() selectedChange = new EventEmitter();

  @Input()
  get root(): AppTreeNodeRoot {
    return this._root;
  }

  set root(node: AppTreeNodeRoot) {
    if (this._root !== node) {
      this._root = node;
      this._root.changed.subscribe((selectedNode: AppTreeNode) => {
        this.selectedChange.emit(selectedNode);
      });
    }
  }

  public static setSelectedChildItems(parent: AppTreeNode, selected: boolean) {
    if (parent.children) {
      parent.children.forEach(child => {
        child.selected = selected ? ClrSelectedState.SELECTED : ClrSelectedState.UNSELECTED;
        AppTreeComponent.setSelectedChildItems(child, selected);
      });
    }
  }

  getChildren(item: AppTreeNode): any[] {
    return item.children ? item.children : null;
  }

  isExpandable(parent: AppTreeNode) {
    return parent.isFolder && !!parent.children && parent.children.length > 0;
  }

  getSelectedLeafes(): AppTreeNode[] {
    return this.root.getSelectedLeafs();
  }

  // fix: Если в модели узла дерева проинициализировано своейство selected, то дерево некорректно работает
  // при разворачивании: оно начинает менять состояние выбранности узлов верхнего уровня при подгрузке
  // дочерних элементов со свойством selected
  changeSelectedChildItems(parent: AppTreeNode, selected: ClrSelectedState) {
    if (parent.selected === selected) { return; }

    parent.selected = selected;
    if (parent && selected !== ClrSelectedState.INDETERMINATE) {
       AppTreeComponent.setSelectedChildItems(parent, selected === ClrSelectedState.SELECTED);
    }
  }

  // changeExpanded(parent: AppTreeNode, expanded: boolean) {
  //   if (parent.expanded === expanded) { return; }
  //   parent.expanded = expanded;
  // }
}
