import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LookupSourceService } from './lookup-source.service';
import { AlertService } from '../../ui/infrastructure/alert.service';
import { StringHelper } from '../../helpers/string-helper';

@Injectable()
export class IndicatorUiService {

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

  static colorStops2 = [
    '#ffffff',
    '#f8f1e9',
    '#eddac7',
    '#e1c5a5',
    '#d9b79a',
    '#d5ae81',
    '#d1a870',
    '#cc9c65',
    '#c89358',
    '#c38b4a',
    '#bb8646',
    '#b37c42',
    '#ac723d',
    '#9f6838',
    '#985e34',
    '#8b552f',
    '#7a4427',
    '#69331e'
  ];

  public paramsFormGroup: FormGroup;

  public selectedIndicators: any[] = [];

  public mapData: any = {};
  public mapIndicator: any;
  public mapNormMode: any = 'color';

  public gridRedrawRequired = new EventEmitter<any>();
  public chartRedrawRequired = new EventEmitter<any>();

  gridData: any[] = [];
  statesHash: any = {};
  gridColumnDefs: any[] = [];
  lineChartHash: any = {};

  public lineChartData: Array<any> = this.buildDefaultSeries();

  public lineChartSize = 36;
  public lineChartStartMonth = 2018 * 12;
  public lineChartLabels: Array<any> =
    ['Янв 2018', 'Фев 2018', 'Мар 2018', 'Апр 2018', 'Май 2018', 'Июн 2018',
      'Июл 2018', 'Авг 2018', 'Сен 2018', 'Окт 2018', 'Ноя 2018', 'Дек 2018',
      'Янв 2019', 'Фев 2019', 'Мар 2019', 'Апр 2019', 'Май 2019', 'Июн 2019',
      'Июл 2019', 'Авг 2019', 'Сен 2019', 'Окт 2019', 'Ноя 2019', 'Дек 2019',
      'Янв 2020', 'Фев 2020', 'Мар 2020', 'Апр 2020', 'Май 2020', 'Июн 2020',
      'Июл 2020', 'Авг 2020', 'Сен 2020', 'Окт 2020', 'Ноя 2020', 'Дек 2020'];
  public lineChartOptions: any = {
    animation: {
      duration: 0
    },
    maintainAspectRatio: false,
    scales: {
      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
        },
        {
          id: 'y-axis-1',
          position: 'right',
          gridLines: {
            color: 'rgba(0,0,0,0)',
          },
        }
      ]
    }
  };
  public lineChartColors: Array<any> = [
    {
      borderColor: 'rgba(148,255,148,1)',
      pointBackgroundColor: 'rgba(148,255,148,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,255,148,0.8)'
    },
    {
      borderColor: 'rgba(148,148,255,1)',
      pointBackgroundColor: 'rgba(148,148,255,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,148,255,0.8)'
    },
  ];

  constructor(private http: HttpClient,
              private fb: FormBuilder,
              private lookupSourceService: LookupSourceService,
              private alertService: AlertService) {
    this.paramsFormGroup = fb.group({
      'indicatorGroup': 'Демография (росстат)',
      'indicatorTypeId': 1,
      'year': 2020,
      'month': 12,
      'mode': 'value'
    });

    this.lookupSourceService.getLookup('indicator-type/favorites').subscribe(allinds => {
      this.paramsFormGroup.get('indicatorGroup').valueChanges.subscribe((newValue) => {

        if (newValue && allinds[newValue] && allinds[newValue].length)
          this.paramsFormGroup.get('indicatorTypeId').setValue(allinds[newValue][0].id);
      });
    });
  }

  private getHistory(indicatorTypeId, stateId): Observable<any[]> {

    return this.http.get(environment.api + `/indicator/history/${indicatorTypeId}/${stateId}`)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  private getPeriod(indicatorTypeId, year, month): Observable<any[]> {

    return this.http.get(environment.api + `/indicator/period/${indicatorTypeId}/${year}/${month}`)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  private buildDefaultSeries() {
    return [
      {seriesId: 'dummy', data: [0], label: 'Выберите показатели правой кнопкой мыши в таблице справа...'},
    ];
  }

  public addIndicator() {
    this.addIndicator2(this.paramsFormGroup.get('indicatorTypeId').value,
      this.paramsFormGroup.get('month').value,
      this.paramsFormGroup.get('year').value,
      this.paramsFormGroup.get('mode').value);
  }

  public addIndicator2(newIndicatorTypeId, selectedMonth, selectedYear, selectedMode) {

    if (!newIndicatorTypeId || !selectedMonth || !selectedYear || !selectedMode) {
      return;
    }

    if (this.selectedIndicators.findIndex(el => el.indicatorTypeId == newIndicatorTypeId
        && el.month == selectedMonth && el.year == selectedYear && el.mode == selectedMode) >= 0) {
      return;
    }

    const newIndicator: any = {};
    newIndicator.indicatorTypeId = newIndicatorTypeId;
    newIndicator.month = selectedMonth;
    newIndicator.year = selectedYear;
    newIndicator.mode = selectedMode;
    this.selectedIndicators.push(newIndicator);

    this.lookupSourceService.getLookupObj('app-indicator-modes').subscribe(indicatorModes => {
      this.lookupSourceService.getLookupObj('indicator-type').subscribe(indicatorTypes => {

        const modePrefix = indicatorModes['Obj' + selectedMode].shortCaption
          ? '[' + indicatorModes['Obj' + selectedMode].shortCaption + '] '
          : '';

        newIndicator.indicatorTypecaption = modePrefix + indicatorTypes[newIndicatorTypeId];
        newIndicator.indicatorCaption = modePrefix + indicatorTypes[newIndicatorTypeId] + ' '
          + StringHelper.getRuDate(new Date(selectedYear, selectedMonth - 1, 1));
        newIndicator.negative = indicatorTypes['Obj' + newIndicatorTypeId].negative;

        this.getPeriod(newIndicatorTypeId, newIndicator.year, newIndicator.month).subscribe(periodData => {
          newIndicator.currentPeriodData = periodData;

          this.selectMapIndicator(newIndicator);
          this.updateGridIndicators();
        });

        this.alertService.success('Индикатор успешно добавлен!');
      });
    });
  }

  public selectMapIndicator(indicator: any) {
    this.mapIndicator = indicator;
    this.mapData = {};
    let RFVal;

    let minVal = 100000000000000, maxVal = -100000000000000;

    indicator.currentPeriodData.forEach(val => {

      const color = indicator.negative ? -val[indicator.mode] : val[indicator.mode];

      if (val.stateId > 0) {
        this.mapData[val.stateId] = {
          stateId: val.stateId,
          color: color,
        };
      }

      if (val.stateId == -1) {
        RFVal = color;
      }

      if (color < minVal) {
        minVal = color;
      }

      if (color > maxVal) {
        maxVal = color;
      }
    });

    // если средний показатель по РФ задан, и он находится "между" остальными показателями - центруем все цвета так,
    // чтобы показатель по РФ был равен нулю
    if (RFVal && RFVal > minVal && RFVal < maxVal) {
      indicator.currentPeriodData.forEach(val => {
        if (val.stateId > 0) {
          this.mapData[val.stateId].color = this.mapData[val.stateId].color - RFVal;
        }
      });
    }

    this.updateDataColors();
  }

  public updateDataColors() {
    this.updateDataColors1(this.mapNormMode);
    this.updateDataColors2(this.mapNormMode);
  }

  private updateDataColors1(useFieldName) {

    // здесь расставляем цвета у положительных значений

    // ищем минимальные-максимальные значения, чтобы потом нормировать
    let minVal = 100000000000000, maxVal = 0;

    for (const mo in this.mapData) {
      if (!this.mapData.hasOwnProperty(mo)) {
        continue;
      }

      const singleMoData = this.mapData[mo];

      if (singleMoData[useFieldName] >= 0) {

        if (minVal > singleMoData[useFieldName]) {
          minVal = singleMoData[useFieldName];
        }

        if (maxVal < singleMoData[useFieldName]) {
          maxVal = singleMoData[useFieldName];
        }
      }
    }

    // теперь нормируем, вычисляя цвет по шкале от 0 (минимальное) до 20 (максимальное)
    for (const mo in this.mapData) {
      if (!this.mapData.hasOwnProperty(mo)) {
        continue;
      }

      const singleMoData = this.mapData[mo];

      if (singleMoData[useFieldName] >= 0) {

        if (maxVal > minVal) {
          const perc = (singleMoData[useFieldName] - minVal) * 17 / (maxVal - minVal);
          singleMoData.__app_color = IndicatorUiService.colorStops[Math.floor(perc)];
        } else {
          singleMoData.__app_color = '#ffffff';
        }
      }
    }
  }

  private updateDataColors2(useFieldName) {

    // здесь расставляем цвета у отрицательных значений

    // ищем минимальные-максимальные значения, чтобы потом нормировать
    let minVal = 0, maxVal = -100000000000000;

    for (const mo in this.mapData) {
      if (!this.mapData.hasOwnProperty(mo)) {
        continue;
      }

      const singleMoData = this.mapData[mo];

      if (singleMoData.color < 0) {
        if (minVal > singleMoData[useFieldName]) {
          minVal = singleMoData[useFieldName];
        }

        if (maxVal < singleMoData[useFieldName]) {
          maxVal = singleMoData[useFieldName];
        }
      }
    }

    // теперь нормируем, вычисляя цвет по шкале от 0 (минимальное) до 17 (максимальное)
    for (const mo in this.mapData) {
      if (!this.mapData.hasOwnProperty(mo)) {
        continue;
      }

      const singleMoData = this.mapData[mo];

      if (singleMoData[useFieldName] < 0) {

        if (maxVal > minVal) {
          const perc = 17 - ((singleMoData[useFieldName] - minVal) * 17 / (maxVal - minVal));
          singleMoData.__app_color = IndicatorUiService.colorStops2[Math.floor(perc)];
        } else {
          singleMoData.__app_color = '#ffffff';
        }
      }
    }
  }

  public deleteIndicator(indicator: any) {
    if (this.mapIndicator === indicator) {
      this.mapIndicator = undefined;
      this.mapData = {};
    }

    const ix_indicator = this.selectedIndicators.findIndex(el => el === indicator);

    if (ix_indicator >= 0) {
      this.selectedIndicators.splice(ix_indicator, 1);
      this.updateGridIndicators();
    }

    let chartRedraw = false;

    for (const seriesId in this.lineChartHash) {
      if (this.lineChartHash.hasOwnProperty(seriesId) && seriesId.startsWith('$' + indicator.indicatorTypeId)) {
        if (this.deleteSeries(seriesId)) {
          chartRedraw = true;
        }
      }
    }

    if (chartRedraw) {
      this.chartRedrawRequired.emit(true);
    }
  }

  private deleteSeries(seriesId) {
    delete this.lineChartHash[seriesId];
    const ix_series = this.lineChartData.findIndex(el => el.seriesId == seriesId);
    if (ix_series >= 0) {
      this.lineChartData.splice(ix_series, 1);

      if (this.lineChartData.length === 0) {
        this.lineChartData = this.buildDefaultSeries();
      }

      return true;
    }
    return false;
  }

  public isIndicatorOnChart(indicator: any, stateId: any) {
    const seriesId = '$' + indicator.indicatorTypeId + ':' + indicator.mode + ':' + stateId;
    return !!this.lineChartHash[seriesId];
  }

  public addChartIndicator(indicator: any, stateId: any, stateCaption: any, yAxisID: any) {

    if (this.isIndicatorOnChart(indicator, stateId)) {
      return;
    }

    const seriesId = '$' + indicator.indicatorTypeId + ':' + indicator.mode + ':' + stateId;

    this.lineChartHash[seriesId] = true;

    this.getHistory(indicator.indicatorTypeId, stateId).subscribe(data => {

      if (this.lineChartData.length === 1 && this.lineChartData[0].seriesId === 'dummy') {
        this.lineChartData = [];
      }

      this.lineChartData.push({
        seriesId: seriesId,
        data: this.normalizeChartData(indicator, data),
        label: indicator.indicatorTypecaption + ' (' + stateCaption + ')',
        yAxisID: yAxisID
      });


      this.chartRedrawRequired.emit(true);
    });
  }

  public removeChartIndicator(indicator: any, stateId: any) {

    if (!this.isIndicatorOnChart(indicator, stateId)) {
      return;
    }

    const seriesId = '$' + indicator.indicatorTypeId + ':' + indicator.mode + ':' + stateId;

    if (this.deleteSeries(seriesId)) {
      this.chartRedrawRequired.emit(true);
    }
  }

  private updateGridIndicators() {
    this.gridColumnDefs = [
      {
        headerName: 'Регион', field: 'stateCaption', width: 120,
      },
    ];

    this.gridData = [];
    this.statesHash = {};

    this.lookupSourceService.getLookup('addr-state', true, true).subscribe(allstates => {


      allstates.forEach(state => {
        const rowdata = {stateCaption: state.caption, stateId: state.id};
        this.statesHash[state.id] = rowdata;
        this.gridData.push(rowdata);
      });

      for (let i = 0; i < this.selectedIndicators.length; i++) {
        const indicator = this.selectedIndicators[i];
        this.gridColumnDefs.push({
          headerName: indicator.indicatorCaption,
          field: 'val' + i, colId: 'val' + i, width: 130,
          cellRenderer: (params => this.renderIndicatorValue(indicator, params))
        });

        (indicator.currentPeriodData || []).forEach(pdata => {
          const rowdata = this.statesHash[pdata.stateId];
          rowdata['val' + i] = pdata[indicator.mode];
        });
      }

      this.gridRedrawRequired.emit(true);
    });

  }

  renderIndicatorValue(indicator: any, params: any) {

    let rendered = params.value || params.value === 0 ? params.value : 'N/A';

    if (this.isIndicatorOnChart(indicator, params.data.stateId)) {
      rendered = '<clr-icon shape="line-chart" size="18" style="margin-top: -6px;color:#0000FF"></clr-icon>&nbsp;' + rendered;
    }

    if (indicator === this.mapIndicator) {

      const singleMoData = this.mapData[params.data.stateId];

      if (singleMoData) {
        rendered = '<span class="map-legend-item" style="background:'
          + (singleMoData.__app_color || '#ffffff') + '">&nbsp;&nbsp;</span>' + rendered;
      }
    }

    return rendered;
  }

  private normalizeChartData(indicator, data: any[]) {

    const normalized = this.lineChartLabels.map(x => undefined);

    data.map(x => {
      const dataindex = x.year * 12 + x.month - 1 - this.lineChartStartMonth;
      if (dataindex >= 0 && dataindex < this.lineChartSize) {
        normalized[dataindex] = x[indicator.mode];
      }
    });

    return normalized;
  }
}
