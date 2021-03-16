import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/internal/operators';
import { StringHelper } from '../../helpers/string-helper';

@Injectable()
export class MetadataService {

  constructor(private http: HttpClient) {
  }

  public getMetadata(metadataName: string): Observable<any[]> {
    const qstring = environment.api + '/metadata/' + metadataName;
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public getMetadataSingle(metadataName: string, id: string): Observable<any> {
    const qstring = environment.api + '/metadata/' + metadataName + '/' + id;
    return this.http.get(qstring);
  }

  public getAddress(id: number): Observable<any> {
    return this.http.get(environment.api + '/address/' + id);
  }

  public getUserForLookup(id: number): Observable<any> {
    return this.http.get(environment.api + '/security/user/lookup/' + id);
  }

  public getUserForLookup2(ids: number[]): Observable<any[]> {
    const qstring = environment.api + '/security/user/lookup';
    return this.http.post(qstring, ids)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public getCitiesLookup(): Observable<any[]> {
    const qstring = environment.api + '/address/city-lookup';
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public getCitiesLookupEx(): Observable<any[]> {
    const qstring = environment.api + '/address/city-lookup-with-comments';
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public getStreetsLookup(regionId: number, cityId: number): Observable<any[]> {
    const qstring = environment.api + '/address/street-lookup/' + regionId + '/' + cityId;
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public getCitiesByRegionLookup(regionId: number): Observable<any[]> {
    const qstring = environment.api + '/address/city-by-region-lookup/' + regionId;
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public preloadFile(uri: string): Observable<string> {
    const qstring = environment.api + '/files/preload?uri=' + encodeURIComponent(uri);
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response.data as string;
      }));
  }

  public prepareLogsZip(dateFrom: Date, dateTo: Date): Observable<string> {
    const qstring = environment.api + '/system/prepare-log';
    return this.http.post(qstring, { dateFrom: dateFrom, dateTo: dateTo })
      .pipe(map((response: any) => {
        return response.data as string;
      }));
  }

  public createReport(reportParams: any): Observable<string> {
    const qstring = environment.api + '/reporting/create';
    return this.http.post(qstring, reportParams)
      .pipe(map((response: any) => {
        return response.data as string;
      }));
  }

  public getReports(reportKind: string): Observable<any[]> {
    const qstring = environment.api + '/reporting/meta/by-kind/' + encodeURIComponent(reportKind);
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public getAllReports(): Observable<any[]> {
    const qstring = environment.api + '/reporting/meta/all';
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public storeReportMeta(reportMeta: any, file: any): Observable<any> {
      const qstring = environment.api + '/reporting/meta/store';

    const formData = new FormData();

    formData.append('file', file);
    formData.append('meta', new Blob([JSON.stringify(reportMeta)], { type: 'application/json' }));

    return this.http.post(qstring, formData)
      .pipe(map((response: any) => {
        return response.data;
      }));
  }

  public deleteReportMeta(id: number) {
    const qstring = environment.api + '/reporting/meta/delete/' + id;
    return this.http.post(qstring, undefined);
  }

  public getAllRoles(): Observable<any[]> {
    const qstring = environment.api + '/security/meta/roles/all';
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public getRoleForEdit(id: any): Observable<any> {
    const qstring = environment.api + '/security/meta/roles/' + id;
    return this.http.get(qstring);
  }

  public storeRole(data: any): Observable<any> {
    const qstring = environment.api + '/security/meta/roles/store';
    return this.http.post(qstring, data).pipe(map(val => (val as any).data));
  }

  public deleteSecurityRole(id: any): Observable<any> {
    const qstring = environment.api + '/security/meta/roles/delete/' + id;
    return this.http.post(qstring, null);
  }

  public getAllFunctions(): Observable<any[]> {
    const qstring = environment.api + '/security/meta/functions/all';
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public updateMeta(metadataName: string, data: any, id: any): Observable<any[]> {
    const qstring = environment.api + '/metadata/' + metadataName + '/update/' + id;
    return this.http.post(qstring, data)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public createMeta(metadataName: string, data: any): Observable<any[]> {
    const qstring = environment.api + '/metadata/' + metadataName;
    return this.http.post(qstring, data)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public deleteMeta(metadataName: string, id: any): Observable<any[]> {
    const qstring = environment.api + '/metadata/' + metadataName + '/delete/' + id;
    return this.http.post(qstring, null)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  getBankAccountValidator(bankId: number, bancAccountId: string): Observable<any> {
    const qstring = environment.api + '/request/is-valid-bank-account/' + bankId + '/' + bancAccountId;
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  getBanks(): Observable<any[]> {
    const qstring = environment.api + '/metadata/bank';
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public getExtraHolidays(year: number): Observable<any> {
    const qstring = environment.api + '/metadata/calendar/holidays/' + year.toString();
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        const datesMap = {};
        response.forEach(el => {
          datesMap[StringHelper.getISODate(new Date(el))] = true;
        });
        return datesMap;
      }));
  }

  public getExtraWorkdays(year: number): Observable<any> {
    const qstring = environment.api + '/metadata/calendar/workdays/' + year.toString();
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        const datesMap = {};
        response.forEach(el => {
          datesMap[StringHelper.getISODate(new Date(el))] = true;
        });
        return datesMap;
      }));
  }

  public addWorkday(date: Date): Observable<any> {
    const qstring = environment.api + '/metadata/calendar/add-workday/' + StringHelper.getISODate(date);
    return this.http.post(qstring, {});
  }

  public deleteWorkday(date: Date): Observable<any> {
    const qstring = environment.api + '/metadata/calendar/delete-workday/' + StringHelper.getISODate(date);
    return this.http.post(qstring, {});
  }

  public addHoliday(date: Date): Observable<any> {
    const qstring = environment.api + '/metadata/calendar/add-holiday/' + StringHelper.getISODate(date);
    return this.http.post(qstring, {});
  }

  public deleteHoliday(date: Date): Observable<any> {
    const qstring = environment.api + '/metadata/calendar/delete-holiday/' + StringHelper.getISODate(date);
    return this.http.post(qstring, {});
  }

  getDefaultReportTemplate(reportId: number): Observable<any> {
    const qstring = environment.api + '/reporting/default-template/' + reportId.toString();
    return this.http.post(qstring, {})
      .pipe(map((response: any) => {
        return response.data;
      }));
  }

  public getZkhServiceWays(serviceId: number, contractorId: number): Observable<any[]> {
    const qstring = environment.api + '/metadata/zkh-service-way/service-contractor/' + serviceId.toString() + '/' + contractorId.toString();
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getZkhServiceWaysByRegionGroupContractor(regionId: number, serviceId: number, contractorId: number,
                                                  omitObsolete: boolean): Observable<any[]> {
    const qstring = environment.api + `/metadata/zkh-service-way/by-region-service-contractor/${regionId}/${serviceId}/${contractorId}` +
      `?omitObsolete=${omitObsolete}`;
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getObsoleteServiceWaysByRegionGroupContractor(regionId: number, serviceId: number, contractorId: number): Observable<any[]> {
    const qstring = environment.api + `/metadata/zkh-service-way/by-region-service-contractor/obsolete/${regionId}/${serviceId}/${contractorId}`;
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getZkhServiceWaysByServiceId(serviceId: number): Observable<any[]> {
    const qstring = environment.api + '/metadata/zkh-service-way/by-service/' + serviceId.toString();
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getZkhServiceWaysByRegionServiceId(regionId: number, serviceId: number): Observable<any[]> {
    const qstring = environment.api + `/metadata/zkh-service-way/by-region-service/${regionId}/${serviceId}`;
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getZkhServiceWaysCurrentRates(serviceId: number): Observable<any[]> {
    const qstring = environment.api + '/metadata/zkh-service-way/current-rates/' + serviceId.toString();
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  distributeRates(params: any): Observable<any[]> {
    const qstring = environment.api + '/metadata/zkh-service-way/distribute-rates';
    return this.http.post(qstring, params)
      .pipe(map((response: any) => {
        return response.data;
      }));
  }

  getAppropriateServiceWays(params: any): Observable<any[]> {
    const qstring = environment.api + '/metadata/zkh-service-way/appropriate';
    return this.http.post(qstring, params)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  distributeServiceWaysToAddr(params: any): Observable<any> {
    const qstring = environment.api + '/metadata/zkh-service-way/distribute';
    return this.http.post(qstring, params)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  searchZkhServiceWays(params: any): Observable<any[]> {
    const qstring = environment.api + '/metadata/zkh-service-way/address-filter';
    return this.http.post(qstring, params)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  getZkhServiceWaysIntersection(params: any): Observable<any[]> {
    const qstring = environment.api + '/metadata/zkh-service-way/way-intersection';
    return this.http.post(qstring, params)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  getZkhServiceWaysEliminateIntersection(params: any[]): Observable<any[]> {
    const qstring = environment.api + '/metadata/zkh-service-way/eliminate-intersection';
    return this.http.post(qstring, params)
      .pipe(map((response: any) => {
        return response.data;
      }));
  }

  public getZkhServiceWaysByAddrStreet(regionId: number, cityId: number, streetId: number, serviceGroupId: number): Observable<any[]> {
    const qstring = environment.api + `/metadata/zkh-service-way-addr/street/${regionId}/${cityId}/${streetId}/${serviceGroupId}`;
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getZkhServicesByRegionAndGroup(regionId: number, groupId: number): Observable<any[]> {
    const qstring = environment.api + `/metadata/zkh-service/by-region-group/${regionId}/${groupId}`;
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getZkhServicesByRegion(regionId: number): Observable<any[]> {
    const qstring = environment.api + `/metadata/zkh-service/by-region/${regionId}`;
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getZkhServiceWaysByAddrCity(regionId: number, cityId: number, serviceGroupId: number): Observable<any[]> {
    const qstring = environment.api + '/metadata/zkh-service-way-addr/city-no-street/'
      + regionId.toString() + '/' + cityId.toString() + '/' + serviceGroupId.toString();
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getZkhServiceWaysByIds(keys: {serviceId: number, id: number}[]): Observable<any[]> {
    const qstring = environment.api + '/metadata/zkh-service-way/by-ids/';
    return this.http.post(qstring, keys)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getZkhServiceWayForEdit(searchParams): Observable<any> {
    const qstring = environment.api + `/metadata/zkh-service-way/by-region`;
    return this.http.post(qstring, searchParams)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  storeZkhServiceWay(zkhServiceWayModel: any, regionId): Observable<any> {
    const qstring = environment.api + `/metadata/zkh-service-way/store-by-region/${regionId}`;
    return this.http.post(qstring, zkhServiceWayModel)
      .pipe(map((response: any) => {
        return response.data;
      }));
  }

  public deleteZkhServiceWay(serviceId: number, id: number): Observable<any> {
    const qstring = environment.api + '/metadata/zkh-service-way/' + serviceId.toString() + '/' + id.toString();
    return this.http.delete(qstring)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  public getContractorsByZkhServiceGroup(serviceGroupId: number, omitObsolete: boolean): Observable<any[]> {
    const qstring = environment.api + '/metadata/contractor/by-group/' + serviceGroupId.toString() + '?omitObsolete=' + omitObsolete;
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getContractorsByRegionZkhGroup(regionId: number, serviceGroupId: number, omitObsolete: boolean): Observable<any[]> {
    const qstring = environment.api + `/metadata/contractor/by-region-group/${regionId}/${serviceGroupId}?omitObsolete=${omitObsolete}`;
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getZkhServicesByRegionGroupContractor(regionId: number, groupId: number, contractorId: number, omitObsolete: boolean): Observable<any[]> {
    const qstring = environment.api + `/metadata/zkh-service/by-region-contractor-group/${regionId}/${contractorId}/${groupId}?omitObsolete=${omitObsolete}`;
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getZkhServicesByZkhGroupAndContractor(zkhServiceGroupId: number, contractorId: number, omitObsolete: boolean): Observable<any[]> {
    const qstring = environment.api + `/metadata/zkh-service/by-contractor-group/${contractorId}/${zkhServiceGroupId}?omitObsolete=${omitObsolete}`;
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getZkhServicesByIds(ids: number[]): Observable<any[]> {
    const qstring = environment.api + '/metadata/zkh-service/by-ids/';
    return this.http.post(qstring, ids)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getZkhRegSubsidy(regionId: number, cityId: number): Observable<any[]> {
    const qstring = environment.api + `/metadata/zkh-regional-standart/${regionId}/${cityId}`;
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public storeRegSubsidy(cityRegStandarts: any): Observable<any[]> {
    const qstring = environment.api + `/metadata/zkh-regional-standart/store`;
    return this.http.post(qstring, cityRegStandarts)
      .pipe(map((response: any) => {
        return response.data;
      }));
  }

  public deleteRegSubsidy(regStandart: any): Observable<any> {
    const qstring = environment.api + `/metadata/zkh-regional-standart/delete`;
    return this.http.post(qstring, regStandart)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  public getAddrDelivery(regionId: number, cityId: number, deliverySchemaId: number): Observable<any[]> {
    const qstring = environment.api + `/metadata/addr-delivery/${regionId}/${cityId}/${deliverySchemaId}`;
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public getPostWithRegions(): Observable<any[]> {
    const qstring = environment.api + `/metadata/addr-delivery/post-with-region`;
    return this.http.get(qstring)
      .pipe(map((response: any[]) => {
        return response;
      }));
  }

  public storeAddrDelivery(delivery: any): Observable<any[]> {
    const qstring = environment.api + `/metadata/addr-delivery/store`;
    return this.http.post(qstring, delivery)
      .pipe(map((response: any) => {
        return response.data;
      }));
  }

  public deleteAddrDelivery(delivery: any): Observable<any> {
    const qstring = environment.api + `/metadata/addr-delivery/delete`;
    return this.http.post(qstring, delivery)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  public storeMspRefundGroupDefault(mspRefundGroupId: number, data: any): Observable<any> {
    const qstring = environment.api + `/metadata/msp-refund-group-defaults/update/${mspRefundGroupId}`;
    return this.http.post(qstring, data)
      .pipe(map(val => (val as any).data));
  }

  public getGatheredOperations(): Observable<any[]> {
    const qstring = environment.api + '/system/get-gathered-operations';
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response.data as any[];
      }));
  }

  public getRunningOperations(): Observable<any[]> {
    const qstring = environment.api + '/system/get-running-operations';
    return this.http.get(qstring)
      .pipe(map((response: any) => {
        return response.data as any[];
      }));
  }

  public getOperationTelemetry(opCode: string, factor: number): Observable<any[]> {
    const qstring = environment.api + '/system/get-operation-telemetry';
    return this.http.post(qstring, {opCode: opCode, factor: factor})
      .pipe(map((response: any) => {
        return response.data as any[];
      }));
  }
}
