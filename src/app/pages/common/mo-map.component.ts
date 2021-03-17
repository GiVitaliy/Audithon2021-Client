import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-mo-map',
  templateUrl: './mo-map.component.html',
})
export class MoMapComponent implements OnChanges {

  static colorStops = [
    '#ffffff',
    '#f1f8e9',
    '#daedc7',
    '#c5e1a5',
    '#b7d99a',
    '#aed581',
    '#a8d170',
    '#9ccc65',
    '#93c858',
    '#8bc34a',
    '#86bb46',
    '#7cb342',
    '#72ac3d',
    '#689f38',
    '#5e9834',
    '#558b2f',
    '#447a27',
    '#33691e'
  ];

  @Input() data;
  focusedId: any;
  focusedMoData: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('data')) {
      this.prettifyData();
      this.updateDataColors();
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

  private updateDataColors() {

    // ищем минимальные-максимальные значения, чтобы потом нормировать
    let minVal = 100000000000000, maxVal = 0;

    for (const mo in this.data) {
      if (!this.data.hasOwnProperty(mo)) {
        continue;
      }

      const singleMoData = this.data[mo];

      if (minVal > singleMoData.color) {
        minVal = singleMoData.color;
      }

      if (maxVal < singleMoData.color) {
        maxVal = singleMoData.color;
      }
    }

    // теперь нормируем, вычисляя цвет по шкале от 0 (минимальное) до 20 (максимальное)
    for (const mo in this.data) {
      if (!this.data.hasOwnProperty(mo)) {
        continue;
      }

      const singleMoData = this.data[mo];

      if (maxVal > minVal && singleMoData.color > 0) {
        const perc = (singleMoData.color - minVal) * 17 / (maxVal - minVal);
        singleMoData.__app_color = MoMapComponent.colorStops[Math.floor(perc)];
      } else {
        singleMoData.__app_color = 'white';
      }
    }
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
