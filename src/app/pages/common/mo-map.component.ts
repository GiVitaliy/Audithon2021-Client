import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-mo-map',
  templateUrl: './mo-map.component.html',
})
export class MoMapComponent implements OnChanges {

  @Input() data;
  @Input() title;
  focusedId: any;
  focusedMoData: any;

  @Output() moClicked = new EventEmitter<any>();

  _forcedFocusedId;
  @Input() get forcedFocusedId() {
    return this._forcedFocusedId;
  }
  set forcedFocusedId(val) {
    this._forcedFocusedId = val;
    this.focusedId = val;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('data')) {
      this.prettifyData();
    }
  }

  mouseover(id) {
    this.focusedId = id;
    this.focusedMoData = this.data[id];
  }

  mouseout(id) {
    if (this.focusedId === id) {
      this.focusedId = undefined;
      this.focusedMoData = undefined;
    }
  }

  mouseclick(id) {
    this.moClicked.emit(id);
  }

  private prettifyData() {
    for (let i = 1; i < 100; i++) {
      this.setupRegionDefaults(i);
    }
    this.setupRegionDefaults(111);
    this.setupRegionDefaults(71100);
    this.setupRegionDefaults(71140);
  }

  private setupRegionDefaults(i: number) {
    if (!this.data[i.toString()]) {
      this.data[i.toString()] = {};
    }

    const singleMoData = this.data[i.toString()];

    if (!singleMoData.__app_params || !singleMoData.__app_params.length) {
      singleMoData.__app_params = [];
    }

    for (const mo in singleMoData) {
      if (!singleMoData.hasOwnProperty(mo)) {
        continue;
      }

      if (mo && mo.startsWith('disp__')) {
        singleMoData.__app_params.push({name: mo.substring(6), value: singleMoData[mo]});
      }
    }
    return singleMoData;
  }
}
