import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../ui/infrastructure/alert.service';
import { GlobalWaitingOverlayService } from '../../ui/infrastructure/global-waiting-overlay.service';
import { GroupOperationsService } from '../../logic/services/group-operations.service';
import { AppNavigationService } from '../../logic/services/app-navigation.service';
import { DateHelper } from '../../helpers/date-helper';
import { StringHelper } from '../../helpers/string-helper';
import { AgGridLocalization } from '../../ui/controls/ag-grid-localization';
import { LookupSourceService } from '../../logic/services/lookup-source.service';

@Component({
  selector: 'app-group-operations-browse',
  templateUrl: './group-operations-browse.component.html'
})
export class GroupOperationsBrowseComponent implements OnInit {

  _searchResults: any[] = [];

  agGridLocaleTextFunc = AgGridLocalization.getLocalization;

  public defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  gridColumnDefs = [
    {
      headerName: '№', field: 'id', width: 90,
    },
    {
      headerName: 'Тип', field: 'typeId',
      width: 300,
      cellRenderer: params => {

        let iconHtml = '';
        if (params.data.stateId === 1 || params.data.stateId === 2) {
          iconHtml = '<clr-icon shape="bolt" style="color: green"></clr-icon>';
        } else if (params.data.stateId === 3) {
          iconHtml = '<clr-icon shape="check-circle" class="is-solid" style="color: green"></clr-icon>';
        } else {
          iconHtml = '<clr-icon shape="exclamation-circle" class="is-solid" style="color: red"></clr-icon>';
        }

        return iconHtml + this.jobTypeLookup[params.value];
      }
    },
    {
      headerName: 'Начало',
      field: 'created',
      width: 160,
      valueFormatter: params => StringHelper.getRuTimeWithSeconds(params.value),
    },
    {
      headerName: 'Завершение',
      field: 'completed',
      width: 160,
      valueFormatter: params => StringHelper.getRuTimeWithSeconds(params.value),
    },
    {
      headerName: 'Прогресс',
      field: 'progress',
      valueFormatter: params => this.calculatePercProgress(params.data) + '%',
    },
  ];

  @ViewChild('agGrid') agGridRef: any;

  jobTypeLookup: any = {};
  redrawTimerId: any;

  constructor(private route: ActivatedRoute,
              private groupOperationsService: GroupOperationsService,
              private alertService: AlertService,
              private globalWaitingOverlayService: GlobalWaitingOverlayService,
              public appNavigationService: AppNavigationService,
              private lookupSourceService: LookupSourceService) {
    this.lookupSourceService.getLookupObj('job-type').subscribe(lookup => this.jobTypeLookup = lookup);
  }

  rowIdFunc(data) {
    return data.id;
  }

  refreshResults() {
    this.globalWaitingOverlayService.StartWaiting();

    this._searchResults = [];

    this.groupOperationsService.readUserOperations(
      DateHelper.addMonths(new Date(), -1)
    ).subscribe(data => {

      this._searchResults = data;

      this.globalWaitingOverlayService.EndWaiting();
    }, error => {
      this.alertService.error(error);
      this.globalWaitingOverlayService.EndWaiting();
    });
  }

  agGridReady() {
    this.agGridRef.api.sizeColumnsToFit();
  }

  ngOnInit() {
    this.route.paramMap
      .subscribe(() => {

        this.refreshResults();
      });
  }

  calculatePercProgress(row: any) {
    return row.progress ? Math.floor(row.progress / 100) : 0;
  }
}
