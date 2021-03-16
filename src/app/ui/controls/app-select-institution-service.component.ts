import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { MetadataService } from '../../logic/services/metadata.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LookupSourceService } from '../../logic/services/lookup-source.service';

@Component({
  selector: 'app-select-institution-service',
  templateUrl: './app-select-institution-service.component.html',
  styleUrls: ['./app-select-institution-service.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AppSelectInstitutionServiceComponent),
    multi: true
  }]
})

export class AppSelectInstitutionServiceComponent implements ControlValueAccessor {
  @Input() disabled: boolean;
  @Input() _availableInstitutionServices: any[];
  @Output() institutionIdChange = new EventEmitter();
  @Output() showPayedChange = new EventEmitter();

  @Input() showPayedInputVisible;
  @Input() showPayed;

  @Output() showUnavailableChange = new EventEmitter();
  @Input() showUnavailable;

  innerValue: any;
  rootServiceForLookup: any;
  selectedCaption: string;
  popupToggled = false;
  treeLookup: any = {};
  selectedStringValue: string;

  private onTouchedCallback = () => {};
  private onChangeCallback = (_: any) => {};

  constructor(private metadataService: MetadataService,
              private lookupSourceService: LookupSourceService) {

  }

  @Input() get availableInstitutionServices(): any[] {
    return this._availableInstitutionServices;
  }

  set availableInstitutionServices(val: any[]) {
    this._availableInstitutionServices = val;
    this.refreshData();
  }

  private refreshData() {
    this.lookupSourceService.getLookup('service-type').subscribe(serviceTypes => {
      this.rootServiceForLookup = this.buildServicesStructure(serviceTypes);
    });
  }

  writeValue(value: any) {
    if (value !== this.innerValue) {
      if ((typeof value) === 'string') {
        this.selectInnerValue(this.treeLookup['is/' + value]);
      } else {
        this.selectInnerValue(value);
      }
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  buildServicesStructure(unsortedServices: any[]): any {
    this.treeLookup = {};

    const services = unsortedServices.slice();
    services.sort((a, b) => (a.caption || '').localeCompare(b.caption || ''));

    // первым проходом строим дерево
    services.forEach(service => {
      if (!this.treeLookup[service.id.toString()]) {
        this.treeLookup[service.id.toString()] = {children: []};
      }
      Object.assign(this.treeLookup[service.id.toString()], service);

      const parentId = service.parentId ? service.parentId.toString() : 'zz';

      if (!this.treeLookup[parentId]) {
        this.treeLookup[parentId] = {children: []};
      }

      this.treeLookup[parentId].children.push(this.treeLookup[service.id.toString()]);
      this.treeLookup[service.id.toString()].parent = this.treeLookup[parentId];
    });

    // вторым проходом добавляем услуги учреждения
    this.availableInstitutionServices.forEach(iService => {

      const parentId = iService.serviceTypeId ? iService.serviceTypeId.toString() : 'zz';

      if (!this.treeLookup[parentId]) {
        return;
      }

      if (!this.showUnavailable && iService.notAvailableForCurrentUser) {
        return;
      }

      const iServId = 'is/' + iService.institutionId.toString() + ':' + iService.id.toString();
      this.treeLookup[iServId] = {};
      Object.assign(this.treeLookup[iServId], iService);
      this.treeLookup[iServId].isForSelect = true;
      this.treeLookup[iServId].warningText = iService.notAvailableForCurrentUser
        ? 'Недоступна для внесения текущим пользователем'
        : undefined;
      this.treeLookup[iServId].strId = iServId;
      this.treeLookup[iServId].parent = this.treeLookup[parentId];
      this.treeLookup[parentId].children.push(this.treeLookup[iServId]);
      if (iServId === this.selectedStringValue) {
        this.selectPath(this.treeLookup[iServId], true);
        this.innerValue = this.treeLookup[iServId];
      }
    });

    // третим проходом удаляем все лишние услуги, т.е. те, которые сами не подлежат включению и не имеют дочерних услуг)
    services.forEach(service => {
      let treeService = this.treeLookup[service.id.toString()];

      // исключаем услуги, не подлежащие включению в ИППСУ (или акт срочных услуг)
      if (service.isForSelect) {
          return;
      }

      // удаляем по всей цепочке
      while (treeService && treeService.parent && treeService.children.length === 0) {

        treeService.parent.children.splice(treeService.parent.children.indexOf(treeService), 1);
        delete this.treeLookup[treeService.id.toString()];
        treeService = treeService.parent;
      }
    });

    this.reduceTree(this.treeLookup['zz']);

    return this.treeLookup['zz'];
  }

  togglePopup() {
    this.popupToggled = !this.popupToggled;
  }

  selectPath(item: any, bSelected: boolean) {
    while (item) {
      item.selected = bSelected;
      if (item.selected) {
        item.expanded = true;
      }
      item = item.parent;
    }
  }

  nodeClick($event: any) {
    if ($event.isForSelect) {
      this.selectInnerValue($event);
      this.onChangeCallback(this.innerValue);
      this.institutionIdChange.emit(this.innerValue);
      this.popupToggled = false;
    }
  }

  selectInnerValue($event: any) {
    this.selectedStringValue = $event ? $event.strId : undefined;
    this.selectPath(this.innerValue, false);
    this.innerValue = $event;
    this.selectPath(this.innerValue, true);
    if (this.innerValue) {
      this.innerValue.selected = true;
      this.selectedCaption = this.innerValue.originalCaption || this.innerValue.caption;
      this.showPayedChangedForced(this.innerValue.forcedPayed);
    } else {
      this.selectedCaption = '';
    }
  }

  // Эта штука схлопывает дерево таким образом, чтобы не было родительских элементов с одним дочерним
  // (чтобы лишние клики пользователь не делал)
  // Ну и заодно отсортируем по наименованию
  private reduceTree(item: any) {
    if (!item.children) {
      return;
    } else  if (item.children.length === 1) {
      if (item.parent) {
        const inParentIx = item.parent.children.findIndex(el => el === item);
        item.parent.children[inParentIx] = item.children[0];
        item.children[0].parent = item.parent;
        item.children[0].originalCaption = item.children[0].caption;
        item.children[0].caption = item.caption + ' / ' + item.children[0].caption;
        this.reduceTree(item.children[0]);
      }
    } else {
      item.children.forEach(child => this.reduceTree(child));
      item.children.sort((a, b) => a.caption.localeCompare(b.caption));
    }
  }

  onClickedOutside($event: Event) {
    this.popupToggled = false;
  }

  showPayedChanged() {
    if (this.showPayedChange) {
      this.showPayedChange.emit(this.showPayed);
    }
  }

  showPayedChangedForced(forcedPayed) {
    if (forcedPayed) {
      this.showPayed = true;
      this.showPayedChanged();
      this.showPayedInputVisible = false;
    } else {
      this.showPayed = false;
      this.showPayedChanged();
      this.showPayedInputVisible = true;
    }
  }

  showUnavailableChanged() {
    if (this.showUnavailableChange) {
      this.showUnavailableChange.emit(this.showUnavailable);
    }

    this.refreshData();
  }
}
