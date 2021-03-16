import { Injectable } from '@angular/core';
import { ParamMap } from '@angular/router';
import { StringHelper } from '../../helpers/string-helper';
import { LookupSourceService } from './lookup-source.service';
import { AsyncSubject, Observable } from 'rxjs/index';
import { map } from 'rxjs/internal/operators';
import { DateHelper } from '../../helpers/date-helper';
import { FormHelper } from '../../ui/controls/form-helper';
import { FormBuilder } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class GroupOperationReportsMetadataService {

  private reports$ = new AsyncSubject<any>();
  private reportGroups$ = new AsyncSubject<any[]>();

  constructor(private lookupSourceService: LookupSourceService,
              private fb: FormBuilder) {

    const reportGroupsObj = {};
  }

  public static getDefaultValue(paramDef: any): any {
    if (paramDef.defaultValue === '$cmonth') {
      return StringHelper.getISODate(DateHelper.startOfTheMonth(new Date()));
    } else if (paramDef.defaultValue === '$cyear') {
      return StringHelper.getISODate(DateHelper.startOfTheYear(new Date()));
    } else if (paramDef.defaultValue === '$cquarter') {
      return StringHelper.getISODate(DateHelper.startOfTheQuarter(new Date()));
    } else if (paramDef.defaultValue === '$emonth') {
      return StringHelper.getISODate(DateHelper.endOfTheMonthByDate(new Date()));
    } else if (paramDef.defaultValue === '$cnextMonth') {
      return StringHelper.getISODate(DateHelper.startOfTheNextMonth(new Date()));
    } else if (paramDef.defaultValue === '$cdate') {
      return StringHelper.getISODate(new Date());
    } else if (paramDef.defaultValue === '$emptylist') {
      return [];
    } else {
      return paramDef.defaultValue;
    }
  }

  public static buildReportFromRawMetadata(reportRaw: any) {
    return {
      id: reportRaw.id,
      opCode: 'op' + reportRaw.id,
      operationTypeId: reportRaw.jobTypeId,
      group: reportRaw.groupCaption || 'Прочие отчеты',
      caption: reportRaw.caption,
      operationTitle: 'Создание отчета \'' + reportRaw.caption + '\'',
      customParameters: reportRaw.customParameters
    };
  }

  public getMassReportGroups$(): Observable<any[]> {
    return this.reportGroups$;
  }

  public getReportMetadata$(opCode: string): Observable<any> {
    return this.reports$.pipe(map(reports => reports[opCode]));
  }

  public getReportMetadataByJobTypeId$(jobTypeId: number, reportId?: number): Observable<any> {
    return this.reports$.pipe(map(reports => {
      for (const rname in reports) {
        if (reports.hasOwnProperty(rname) && reports[rname].operationTypeId === jobTypeId
          && (!reportId || reports[rname].id === reportId)) {
          return reports[rname];
        }
      }
      return undefined;
    }));
  }

  public getOpParamsGroupDef$(params: ParamMap, opCode: string): Observable<any> {
    return this.getReportMetadata$(opCode).pipe(map(report => {
      if (!report) {
        return undefined;
      }

      const groupDef: any = {exportSur: false};

      report.customParameters.forEach(paramDef => {
        if (+paramDef.dataType === 4) { // type: array
          groupDef[paramDef.code] = this.fb.array([]);
        } else {
          groupDef[paramDef.code] = [params.get(paramDef.code)];
        }
        if (+paramDef.dataType === 2) { // type: DateTime
          groupDef[paramDef.code].push(FormHelper.validateDateTimePicker());
        }
      });

      groupDef.reportId = report.id;

      return groupDef;
    }));
  }

  public getOpDefaultParams$(opCode: string): Observable<any> {
    return this.getReportMetadata$(opCode).pipe(map(report => {
        if (!report) {
          return undefined;
        }

        const groupDef: any = {};

        report.customParameters.forEach(paramDef => {
          groupDef[paramDef.code] = GroupOperationReportsMetadataService.getDefaultValue(paramDef);
        });

        groupDef.uniqueTag = 'new$' + Math.floor(Math.random() * 100000000000) + 1;

        return groupDef;
      }
    ));
  }
}
