import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../../ui/infrastructure/alert.service';
import { GlobalWaitingOverlayService } from '../../../ui/infrastructure/global-waiting-overlay.service';
import { MetadataService } from '../../../logic/services/metadata.service';
import { FormBuilder, Validators } from '@angular/forms';
import { MetaBrowseBaseComponent } from '../meta-browse.base.component';
import { LookupSourceService } from '../../../logic/services/lookup-source.service';
import { AgGridLocalization } from '../../../ui/controls/ag-grid-localization';
import { StringHelper } from '../../../helpers/string-helper';
import { JobRunnerUiService } from '../../../ui/infrastructure/job-runner-ui.service';

@Component({
  templateUrl: './job-schedule-browse.component.html'
})
export class JobScheduleBrowseComponent extends MetaBrowseBaseComponent {

  agGridLocaleTextFunc = AgGridLocalization.getLocalization;

  public defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  gridColumnDefs = [
    {headerName: '№', field: 'id', width: 100},
    {
      headerName: 'Операция', field: 'jobTypeId', width: 250,
      valueFormatter: params => this.jobTypes[params.value]
    },
    {
      headerName: 'Периодичность', field: 'jobPeriodicity', width: 250,
      valueFormatter: params => this.schedulePeriodicities[params.value]
    },
    {headerName: 'Час запуска с', field: 'allowedHourFrom', width: 150},
    {headerName: 'Час запуска по', field: 'allowedHourToExcluded', width: 150},
    {headerName: 'День запуска', field: 'plannedDay', width: 150},
    {
      headerName: 'Включена', field: 'enabled', width: 100,
      valueFormatter: params => params.value ? 'Да' : ''
    },
  ];

  schedulePeriodicities: any = {};
  jobTypes: any = {};

  constructor(route: ActivatedRoute,
              metadataService: MetadataService,
              alertService: AlertService,
              globalWaitingOverlayService: GlobalWaitingOverlayService,
              lookupService: LookupSourceService,
              fb: FormBuilder,

              private jobRunnerUiService: JobRunnerUiService) {
    super(route, metadataService, alertService, globalWaitingOverlayService, lookupService, fb);

    this.lookupService.getLookupObj('job-schedule-item-periodicity').subscribe(lookup => this.schedulePeriodicities = lookup);
    this.lookupService.getLookupObj('job-type').subscribe(lookup => this.jobTypes = lookup);
  }

  getMetaTitle(): string {
    return 'Расписание фоновых задач';
  }

  getMetaName(): string {
    return 'job-schedule-item';
  }

  getRowStyle(params) {
    if (params.data && !params.data.enabled) {
      return {color: 'silver'};
    }
  }

  getGroupDef(row: any) {
    return {
      id: row.id,
      jobTypeId: [row.jobTypeId, Validators.required],
      parameters: [row.parameters, Validators.required],
      jobPeriodicity: [row.jobPeriodicity, Validators.required],
      allowedHourFrom: [row.allowedHourFrom, Validators.compose([Validators.required, Validators.pattern(/^\d{1,2}$/)])],
      allowedHourToExcluded: [row.allowedHourToExcluded, Validators.compose([Validators.required, Validators.pattern(/^\d{1,2}$/)])],
      plannedDay: [row.plannedDay, Validators.compose([Validators.required, Validators.pattern(/^\d{1,2}$/)])],
      enabled: [row.enabled == null ? true : row.enabled, Validators.required],
    };
  }

  runOperation() {
    this.alertService.confirmModal('Запустить операцию сейчас с текущими заполненными параметрами?').subscribe(confirm => {
      if (confirm) {
        const params = StringHelper.tryParseJSON(this.currentFormGroup.get('parameters').value);
        if (params) {
          const type = this.jobTypes['Obj' + this.currentFormGroup.get('jobTypeId').value];
          params['type'] = type.runnerBeanName;
          this.jobRunnerUiService.runOperation(this.currentFormGroup.get('jobTypeId').value, params).subscribe(result => {
          });
        } else {
          this.alertService.warning('Не корректные параметры операции - не возможно преобразовать в JSON');
        }
      }
    });
  }

}
