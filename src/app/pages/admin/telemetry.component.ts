import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, timer } from 'rxjs/index';
import { MetadataService } from '../../logic/services/metadata.service';
import { first } from 'rxjs/internal/operators';

@Component({
  templateUrl: './telemetry.component.html'
})
export class TelemetryComponent implements OnInit, OnDestroy {

  constructor(private metadataService: MetadataService) {
  }

  // lineChart
  public lineChartData: Array<any> = [
    {data: [0], label: 'Запросы, мс'},
    {data: [0], label: 'Запросы, ед', yAxisID: 'y-axis-1'},
  ];
  public lineChartLabels: Array<any> = [''];
  public lineChartOptions: any = {
    animation: {
      duration: 0
    },
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
      backgroundColor: 'rgba(148,255,148,0.2)',
      borderColor: 'rgba(148,255,148,1)',
      pointBackgroundColor: 'rgba(148,255,148,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,255,148,0.8)'
    },
    {
      backgroundColor: 'rgba(0,0,0,0)',
      borderColor: 'rgba(148,148,255,1)',
      pointBackgroundColor: 'rgba(148,148,255,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,148,255,0.8)'
    },
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  private _interval = '3';
  private _conversationTypeId = '@Total';

  public get interval(): string {
    return this._interval;
  }

  public set interval(value: string) {
    this._interval = value;
    this.tickerFunc();
  }

  public get conversationTypeId(): string {
    return this._conversationTypeId;
  }

  public set conversationTypeId(value: string) {
    this._conversationTypeId = value;
    this.tickerFunc();
  }

  public conversationTypes: any[] = [{Id: undefined as number, Name: 'Загружаю список...'}];
  public conversationTypes2: any[] = [{Id: undefined as number, Name: 'Загружаю список...'}];
  public runningOperations: any[] = [];

  private timer: Observable<number>;
  private sub: Subscription;

  ngOnInit() {
    this.refreshGatheredOperations();
    this.refreshRunningOperations();
    this.tickerFunc();
  }

  public refreshGatheredOperations() {
    this.metadataService.getGatheredOperations().subscribe((items: any[]) => {
      this.conversationTypes = items;
      this.conversationTypes.sort((a, b) => (a.a || '').localeCompare(b.a || ''));
      this.conversationTypes2 = items.slice();
      this.conversationTypes2.sort((b, a) => (a.b || 0) - (b.b || 0));
    });
  }

  public refreshRunningOperations() {
    this.metadataService.getRunningOperations().subscribe((items: any[]) => {
      this.runningOperations = items;
      this.runningOperations.sort((a, b) => (a.started || 0) - (b.started || 0));
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
  }

  tickerFunc() {

    const cInterval = +this.interval;

    const refreshPeriod = cInterval * 10000;

    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }

    this.timer = timer(refreshPeriod, refreshPeriod);
    this.sub = this.timer.pipe(first()).subscribe(t => this.tickerFunc());

    this.metadataService.getOperationTelemetry(this._conversationTypeId, cInterval).subscribe(
      data => {
        // clearing out all
        this.lineChartData[0].data = [];
        this.lineChartLabels = [];

        // filling array
        this.populateSeries(data);
      }
    );
  }

  populateSeries(data: any[]) {
    this.lineChartData[0].data = data.map(x => x.a);
    this.lineChartData[1].data = data.map(x => x.b);
    this.lineChartLabels = data.map(x => x.c);
  }

  formatAverage(item: any) {
    return item.c ? Math.round(+item.b / +item.c).toString() + ' мс' : '-';
  }
}
