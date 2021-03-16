import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { StringHelper } from '../../helpers/string-helper';
import { map } from 'rxjs/internal/operators';

@Injectable()
export class GroupOperationsService {

  public static RppsuConverting = 1;
  public static ReportServicesCostTotal = 3;
  public static ReportHierarchicalServices = 5;
  public static FiasLoading = 7;
  public static SupplierReportLoading = 8;
  public static ReportServicesCostDetailed = 10;
  public static ReportStateOrder = 11;
  public static EgissoLocalMszExporting = 12;
  public static EgissoOrganizationExporting = 13;
  public static MspGroupOperation = 24;
  public static UniversalImporter = 25;
  public static FiasHLoading = 27;
  public static FiasRLoading = 28;
  public static PaydocExporter = 30;
  public static InteractiveRequestsMonitoring = 31;
  public static InteractivePaymentsMonitoring = 32;
  public static QueryRunner = 35;
  public static QueryCsvExporter = 36;
  public static UpdateAddresses = 45;
  public static AssignMspByTarget = 47;
  public static AssignMspByPerson = 48;
  public static SetMspDecision = 49;
  public static SetMspDateTo = 51; // Массовое продление МСП
  public static QueryPfrExporter = 53;
  public static MspGroupOperationAll = 54; // Групповая обработка назначений (регион)
  public static CreateRequestByTarget = 57; // Массовое создание обращений по выборке обращений
  public static CreateRequestByPerson = 58; // Массовое создание обращений по выборке граждан
  public static PaydocToggleReceiveMark = 59;
  public static PaydocDelete = 60;

  constructor(private http: HttpClient) {
  }

  public runOperation(opType: number, params: any, file?: any, data?: any): Observable<any> {
    const qstring = environment.api + '/jobs/' + opType;

    const formData = new FormData();
    formData.append('meta', new Blob([JSON.stringify(params)], {type: 'application/json'}));
    if (file) {
      formData.append('file', file);
    }
    if (data) {
      formData.append('file', new Blob([JSON.stringify(data)], {type: 'application/json'}));
    }

    return this.http.post(qstring, formData)
      .pipe(map((response: any) => {
        return response.data;
      }));
  }

  public cancelOperation(typeId: number, id: number): Observable<any> {
    const qstring = environment.api + '/jobs/delete/' + typeId + '/' + id;
    return this.http.post(qstring, {})
      .pipe(map((response: any) => {
        return response;
      }));
  }

  public getOperationStatus(typeId: number, id: number): Observable<any> {
    const qstring = environment.api + '/jobs/' + typeId + '/' + id;
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  public getOperationResult(typeId: number, id: number): Observable<any> {
    const qstring = environment.api + '/jobs/data/' + typeId + '/' + id;
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  public getLatestOperationResults(typeId: number, params: any): Observable<any[]> {
    const qstring = environment.api + '/jobs/data/latest/' + typeId;
    return this.http.post(qstring, params)
      .pipe(map((response: any) => {
        return response.data as any[];
      }));
  }

  public readUserOperations(dateFrom?: Date, dateTo?: Date, stateId?: number): Observable<any[]> {
    let qstring = environment.api + '/jobs/data?_=1';

    if (dateFrom) {
      qstring = qstring + '&dateFrom=' + StringHelper.getISODate(dateFrom);
    }
    if (dateTo) {
      qstring = qstring + '&dateTo=' + StringHelper.getISODate(dateTo);
    }
    if (stateId) {
      qstring = qstring + '&state=' + stateId;
    }

    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }
}
