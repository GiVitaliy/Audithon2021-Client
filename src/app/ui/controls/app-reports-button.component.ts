import { Component, Input } from '@angular/core';
import { MetadataService } from '../../logic/services/metadata.service';
import { environment } from '../../../environments/environment';
import { forkJoin, Observable, ReplaySubject } from 'rxjs/index';
import { FormArray, FormBuilder } from '@angular/forms';
import { FormHelper } from './form-helper';
import { first } from 'rxjs/operators';
import { LookupSourceService } from '../../logic/services/lookup-source.service';
import { GroupOperationReportsMetadataService } from '../../logic/services/group-operation-reports-metadata.service';

@Component({
  selector: 'app-reports-button',
  templateUrl: './app-reports-button.component.html',
  styles: ['.dropdown-menu { max-width: 28rem; }']
})
export class AppReportsButtonComponent {
  isInvalid = FormHelper.isInvalid;
  @Input() disabled: boolean;
  printing = false;
  availableReports = [];
  availableGroups = [];
  @Input() tinyLinkMode = false;
  @Input() withoutBorder = false;
  @Input() objId1;
  @Input() objId2;
  @Input() objId3;
  @Input() dropdownPosition = 'bottom-left';
  @Input() title = 'Печать';

  private paramsChoosedObs: ReplaySubject<any>;
  private paramsValues: FormArray;
  public chooseParamsModalVisible = false;

  constructor(private lookupSourceService: LookupSourceService,
              private metadataService: MetadataService,
              private fb: FormBuilder) {
  }

  private _reportKind: string;
  @Input()
  get reportKind() {
    return this._reportKind;
  }

  set reportKind(val: string) {
    if (val !== this.reportKind) {
      this._reportKind = val;

      const reportKinds = val.split(',');
      forkJoin(<Observable<any[]>[]>reportKinds.map(
        reportKind => this.lookupSourceService.getLookup('report-' + reportKind).pipe(first())))
        .subscribe((reports: any[][]) => {
          const reportList = [].concat.apply([], reports);
          this.setupReportList(reportList);
        });
    }
  }

  private setupReportList(reportList: any) {

    const groups = [];
    const groupHash = {};
    const reportsWithoutGroup = [];

    (reportList || []).forEach(report => {
      if (report.groupCaption) {
        if (!groupHash[report.groupCaption]) {
          groupHash[report.groupCaption] = {caption: report.groupCaption, reports: []};
          groups.push(groupHash[report.groupCaption]);
        }
        groupHash[report.groupCaption].reports.push(report);
      } else {
        reportsWithoutGroup.push(report);
      }
    });


    this.availableReports = reportsWithoutGroup;
    this.availableGroups = groups;
  }

  printForm(report: any) {
    this.printing = true;

    this.chooseReportCustomParams(report).subscribe(params => {

      if (!params) {
        this.printing = false;
        return;
      }

      this.metadataService.createReport({
        reportId: report.id,
        objId1: this.objId1,
        objId2: this.objId2,
        objId3: this.objId3,
        customParamValues: params,
      }).subscribe({
        next: fileHash => {
          this.printing = false;
          window.open(environment.api + '/files/get?preloadId=' + encodeURIComponent(fileHash));
        },
        error: () => {
          this.printing = false;
        }
      });
    });
  }

  chooseReportCustomParams(report: any): Observable<any> {

    this.paramsChoosedObs = new ReplaySubject<any>();

    if (!report.customParameters || !report.customParameters.length) {
      this.paramsChoosedObs.next([]);
    } else {
      this.checkOnEditableCustomParams(this.paramsValues);
    }

    return this.paramsChoosedObs;
  }

  public chooseParamsCompleted() {

    if (!this.paramsValues.valid) {
      return;
    }

    this.paramsChoosedObs.next(this.paramsValues.value);
    this.chooseParamsModalVisible = false;
  }

  public chooseParamsCancelled() {
    this.paramsChoosedObs.next(undefined);
    this.chooseParamsModalVisible = false;
  }

  private checkOnEditableCustomParams(paramsValues: any) {

    const control = paramsValues.value;

    for (let i = control.length - 1; i >= 0; i--) {
      if (control[i].dataType === 999) {
        this.paramsValues.removeAt(i);
      }
    }

    if (paramsValues.value.length) {
      this.chooseParamsModalVisible = true;

    } else {
      this.paramsChoosedObs.next([]);
    }
  }
}
