import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StringHelper } from '../../helpers/string-helper';

@Injectable()
export class AdminService {

  uriDictionary = {
    get: {
      servicesTypesRoomsAndEquipmentTabActive:      'resource_type',
      servicesTypesSocServicesTabActive:            undefined,  // скрипты этого справочника формируются уникально
      servicesTypesPostTabActive:                   'institution_post',
      servicesTermsServicesTabActive:               'service_term',
      servicesTypesDepartmentsTabActive:            'department_type',
      servicesIndicatorsInstitutionTabActive:       'institution_indicator',
      servicesTrainingProgramTabActive:             'training_program',
      ipraTargetIpraTabActive:                      'ipra_goal',
      ipraRangeValuesTabActive:                     'ipra_mark_range',
      ipraGroupIndicatorsTabActive:                 'ipra_mark_group',
      ipraIndicatorTabActive:                       'ipra_mark',
      ipraRangeValuesRestrictionsTabActive:         'ipra_restriction_range',
      ipraRestrictionsTabActive:                    'ipra_restriction',
      ipraEventsTabActive:                          'ipra_event_link',
      zkhRegSubsidyTabActive:                       'zkh_regional_standart',
      zkhContractorTabActive:                       'contractor',
      requestTypeTabActive:                         'request_type',
      requestTypeGroupTabActive:                    'request_type_group',
      requestCloseReasonTabActive:                  'close_reason',
      requestNomenclatureTabActive:                 'nomenclature',
      mspTypeTabActive:                             'msp_type',
      mspGroupTabActive:                            'msp_refund_group',
      mspBanksTabActive:                            'bank',
      mspPostDepartmentTabActive:                   'postal_office',
      mspRefundGroupDefaultsTabActive:              'msp_refund_group',
      sysQueryViewTabActive:                        'sys_query_view',
      mspTariffsTabActive:                          'doc_t13_subtype_rate'
    },
    post: {
      servicesTemplateIppsuTabActive:               ['ipra_restriction_range', 'ipra_restriction',
                                                     'ippsu_template', 'ippsu_template_ipra_service',
                                                     'ippsu_template_service'],
      docsTabActive:                                ['doc_type', 'doc_source', 'doc_subtype'],
      livingMinimumTabActive:                       ['living_minimum', 'living_minimum_amount'],
      addressTabActive:                             ['addr_region', 'addr_city_type', 'addr_city',
                                                     'addr_street_type', 'addr_street', 'addr_delivery'],
      zkhServiceWayTabActive:                       ['zkh_service_way', 'zkh_service_way_addr',
                                                     'zkh_service_way_norm', 'zkh_service_way_rate'],
      zkhServicesTabActive:                         ['zkh_service_group', 'zkh_service'],
    }
  };

  constructor(private http: HttpClient) {}

  public runScript(data: any): Observable<any> {
    return this.http.post(environment.api + '/admin/script/input', data)
      .pipe(map((response: any) => {
        return response as any;
      }));
  }

  public getScriptDictionary(keyDictionary: string): Observable<any[]> {

    if (this.uriDictionary.post.hasOwnProperty(keyDictionary)) {

      return this.http.post(environment.api + '/admin/script/dictionary/list', this.uriDictionary.post[keyDictionary])
        .pipe(map((response: any) => {
          return response as any[];
        }));
    } else {

      return this.http.get(environment.api + '/admin/script/dictionary/' + this.uriDictionary.get[keyDictionary])
        .pipe(map((response: any) => {
          return response as any[];
        }));
    }
  }

  public getScriptDictionarySocServices(): Observable<any[]> {

    return this.http.get(environment.api + '/admin/script/dictionary/soc-services')
        .pipe(map((response: any) => {
          return response as any[];
        }));
  }

  public getScriptInstitutions(data: any[]): Observable<any[]> {
    return this.http.post(environment.api + '/admin/script/institution/', data)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public getScriptPerson(personId: number): Observable<any[]> {
    return this.http.get(environment.api + '/admin/script/person/' + personId)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public getScriptPersonRequestsWithFilters(personId: number,
                                           dateFrom: string,
                                           dateToIncluded: string,
                                           onlyCurrentNotClosed: boolean): Observable<any[]> {
    if (dateFrom || dateToIncluded) {

      dateFrom = dateFrom ? dateFrom : '1900-01-01';
      dateToIncluded = dateToIncluded ? dateToIncluded : StringHelper.getISODate(new Date());

      return this.http.get(environment.api + '/admin/script/person/requests/' + dateFrom + '/' + dateToIncluded + '/' + personId)
        .pipe(map((response: any) => {
          return response as any[];
        }));
    }

    if (onlyCurrentNotClosed) {
      return this.http.get(environment.api + '/admin/script/person/requests/current/' + personId)
        .pipe(map((response: any) => {
          return response as any[];
        }));
    }
  }

  public getScriptPersonRequests(personId: number, requestId: number): Observable<any[]> {

    if (requestId != null) {
      return this.http.get(environment.api + '/admin/script/person/requests/' + personId + '/' + requestId)
        .pipe(map((response: any) => {
          return response as any[];
        }));
    }
    return this.http.get(environment.api + '/admin/script/person/requests/' + personId)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public getScriptPersonServiceAllByPersonId(personId: number): Observable<any[]> {

    return this.http.get(environment.api + '/admin/script/person/service/' + personId)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public getScriptPersonServiceByPersonIdAndRequestId(personId: number, requestId: number): Observable<any[]> {

    return this.http.get(environment.api + '/admin/script/person/service/' + personId + '/' + requestId)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }

  public getScriptPersonIpraByPersonIdAndIpraId(personId: number, ipraId: number): Observable<any[]> {

    return this.http.get(environment.api + '/admin/script/person/ipra/' + personId + '/' + ipraId)
      .pipe(map((response: any) => {
        return response as any[];
      }));
  }
}
