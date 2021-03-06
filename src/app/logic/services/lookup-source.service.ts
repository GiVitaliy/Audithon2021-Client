import { Injectable } from '@angular/core';
import { MetadataService } from './metadata.service';
import { DataCachingService } from './data-caching.service';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { map } from 'rxjs/internal/operators';
import { isArray } from 'rxjs/internal/util/isArray';

@Injectable()
export class LookupSourceService {
  constructor(private metadataService: MetadataService,
              private dataCachingService: DataCachingService) {

  }

  public invalidateLookup(lookupName: string) {
    if (!lookupName) {
      return;
    }
    lookupName = lookupName.toLowerCase();
    this.dataCachingService.removeCachedData('LookupSourceService', lookupName);
    this.dataCachingService.removeCachedData('LookupSourceServiceObj', lookupName);
  }

  public getLookup(lookupName: string, clone?: boolean, sort?: boolean, showHistory?: boolean): Observable<any[]> {
    if (!lookupName) {
      return new BehaviorSubject([]);
    }

    lookupName = lookupName.toLowerCase();
    let existing: Subject<any[]> = this.dataCachingService.getCachedData('LookupSourceService', lookupName);
    let existingActual: Subject<any[]> = this.dataCachingService.getCachedData('LookupSourceServiceActual', lookupName);

    if (!existing || !existingActual) {
      existing = new ReplaySubject<any[]>();
      existingActual = new ReplaySubject<any[]>();
      this.dataCachingService.addToCache('LookupSourceService', lookupName, existing, 200);
      this.dataCachingService.addToCache('LookupSourceServiceActual', lookupName, existingActual, 200);
      existing.subscribe((val: any[]) => {
        let val2 = [];
        if (isArray(val)) {
          val.forEach(el => {
            if (el && !el.dateDeleted) {
              val2.push(el);
            }
          });
        } else {
          val2 = val;
        }

        existingActual.next(val2);
      });
      this.preloadData(lookupName, existing);
    }

    const lookupSliceToUse = showHistory ? existing : existingActual;

    if (clone || sort) {
      return lookupSliceToUse.pipe(map(dict => {
        const newDict = [];
        dict.forEach(el => {
          const newEl = {};
          Object.assign(newEl, el);
          newDict.push(newEl);
        });

        if (sort) {
          newDict.sort((a, b) => a.caption.localeCompare(b.caption));
        }

        return newDict;
      }));
    } else {
      return lookupSliceToUse;
    }
  }

  public getLookupObj(lookupName: string): Observable<any> {
    if (lookupName === 'addr-street') {
      throw new Error('getLookupObj ?????? addr-street ???? ????????????????');
    }

    lookupName = lookupName.toLowerCase();
    let existing: Subject<any> = this.dataCachingService.getCachedData('LookupSourceServiceObj', lookupName);

    if (existing) {
      return existing;
    } else {
      existing = new ReplaySubject<any>();

      this.getLookup(lookupName, false, false, true).subscribe((arr): any => {
        const val = {};
        if (arr) {
          arr.forEach(item => {
            val[item.id] = item.caption;
            val['Obj' + item.id.toString()] = item;
          });
        }
        existing.next(val);
      });

      this.dataCachingService.addToCache('LookupSourceServiceObj', lookupName, existing, 200);

      return existing;
    }
  }

  getLookupCaption(value: any, lookupName: string, useShort?: boolean, objId2?: any): Observable<string> {
    if (!value && value !== 0) {
      return new BehaviorSubject<any>('-');
    }

    if (!useShort) {
      return this.getLookupObj(lookupName).pipe(map(lookup => lookup[value] || 'N/A'));
    } else {
      return this.getLookupObj(lookupName)
        .pipe(map(lookup => lookup['Obj' + value]
          ? (lookup['Obj' + value].shortCaption || lookup['Obj' + value].caption)
          : 'N/A'));
    }
  }

  private preloadData(lookupNameLower: string, existing: Subject<any[]>) {
    if (lookupNameLower.startsWith('doc-subtype')) {
      this.preloadTwoLevelLookup(lookupNameLower, 'doc-subtype', 'docTypeId', 'docSubtypeId', existing);
    } else if (lookupNameLower.startsWith('request-type-subject')) {
      this.preloadTwoLevelLookup(lookupNameLower, 'request-type-subject', 'requestTypeId', 'id', existing);
    } else if (lookupNameLower.startsWith('indicator-type/favorites')) {
      this.preloadTwoLevelLookup(lookupNameLower, 'indicator-type/favorites', 'group', 'id', existing);
    } else if (lookupNameLower === 'addr-city') {
      this.metadataService.getCitiesLookup().subscribe(val => {
        existing.next(val);
      });
    } else if (lookupNameLower === 'addr-city-ex') {
      this.metadataService.getCitiesLookupEx().subscribe(val => {
        existing.next(val);
      });
    } else if (lookupNameLower === 'reporting-all') {
      this.metadataService.getAllReports().subscribe(val => {
        existing.next(val.map(item => {
          return {
            id: item.id,
            caption: item.caption
          };
        }));
      });
    } else if (lookupNameLower === 'addr-street-type') {
      this.metadataService.getMetadata(lookupNameLower).subscribe(val => existing.next(val));
    } else if (lookupNameLower.startsWith('city-by-region-')) {
      const matches = lookupNameLower.match(/city-by-region-(-*\d+)/);
      if (matches) {
        this.metadataService.getCitiesByRegionLookup(+matches[1]).subscribe(val => {
          existing.next(val);
        });
      }
    } else if (lookupNameLower.startsWith('addr-street-')) {
      const matches = lookupNameLower.match(/addr-street-(-*\d+)-(-*\d+)/);
      if (matches) {
        this.metadataService.getStreetsLookup(+matches[1], +matches[2]).subscribe(val => {
          existing.next(val);
        });
      }
    } else if (lookupNameLower === 'gender') {
      existing.next([{id: true, caption: '??????'}, {id: false, caption: '??????'}]);
    } else if (lookupNameLower === 'person-group-visibility') {
      existing.next([{id: 1, caption: '??????????????????'}, {id: 2, caption: '????????????????????'}, {id: 3, caption: '????????????????????????'}]);
    } else if (lookupNameLower === 'journal-change-type') {
      existing.next([
        {id: 1, caption: '????????????????????'},
        {id: 2, caption: '????????????????????????????'},
        {id: 3, caption: '????????????????'},
        {id: 4, caption: '?????????????????? ??????????????'},
        {id: 5, caption: '???????????????????????????? ?????????????? ????????????????????????'},
        {id: 6, caption: '???????????????? ????????'}
      ]);
    } else if (lookupNameLower === 'app-months') {
      existing.next([
        {id: 1, caption: '????????????'},
        {id: 2, caption: '??????????????'},
        {id: 3, caption: '????????'},
        {id: 4, caption: '????????????'},
        {id: 5, caption: '??????'},
        {id: 6, caption: '????????'},
        {id: 7, caption: '????????'},
        {id: 8, caption: '????????????'},
        {id: 9, caption: '????????????????'},
        {id: 10, caption: '??????????????'},
        {id: 11, caption: '????????????'},
        {id: 12, caption: '??????????????'},
      ]);
    } else if (lookupNameLower === 'app-indicator-modes') {
      existing.next([{id: 'value', caption: '??????????????????'},
        {id: 'valueMa', caption: '???????????????????? ????.', shortCaption: '????????????.????.'},
        {id: 'valueMaTrend', caption: '????.????. ??????????', shortCaption: '??????????'},
        {id: 'valueMaTrendX2', caption: '????.????. ?????????? 2x', shortCaption: '???????????????? ????????????'}]);
    } else if (lookupNameLower === 'app-years') {
      existing.next([{id: 2018, caption: '2018'},
        {id: 2019, caption: '2019'},
        {id: 2020, caption: '2020'}]);
    } else if (lookupNameLower === 'report-period-mode') {
      existing.next([{id: 1, caption: '???? ??????????'}, {id: 2, caption: '???? ??????????????'}]);
    } else if (lookupNameLower === 'rsdp-export-mode') {
      existing.next([{id: 1, caption: '????????????'}, {id: 2, caption: '????????????'}]);
    } else if (lookupNameLower === 'smev-message-status') {
      existing.next([{id: 1, caption: '?? ????????????'},
        {id: 2, caption: '?????????????????? ????????????????????????????'},
        {id: 3, caption: '?????????????? ??????????????????'},
        {id: 4, caption: '?????????????????? ?? ????????????????'}]);
    } else if (lookupNameLower === 'report-output-format') {
      existing.next([{id: 'odt', caption: 'XDocReport Open Document (.odt)'},
        {id: 'odtPdf', caption: 'XDocReport PDF .odt'},
        {id: 'jasperPdf', caption: 'JasperReports PDF .jrxml'},
        {id: 'jasperXlsx', caption: 'JasperReports Xls .jrxml'},
        {id: 'jasperDocx', caption: 'JasperReports Docx .jrxml'},
        {id: 'customCsv', caption: 'Comma-Separated Values (.csv)'},
        {id: 'xlsx', caption: 'Excel .xlsx'}]);
    } else if (lookupNameLower === 'daily-schedule-kind') {
      existing.next([{id: 1, caption: '??????????????????'}, {id: 2, caption: '??????????????????????'}, {id: 3, caption: '????????????????????'}]);
    } else if (lookupNameLower === 'security-function-scope') {
      existing.next([{id: 10, caption: '?????? ??????????????'}, {id: 20, caption: '??????????????, ?????????????????? ?? ???????????????????? ??????????????????????'},
        {id: 30, caption: '??????????????, ?????????????????? ?? ??????????????????????'},
        {id: 40, caption: '?????????????? ?????????????????????????? ????????????????????'}, {id: 50, caption: '?????????????? ????????????????????????'}]);
    } else if (lookupNameLower === 'week-days') {
      existing.next([{id: 0, caption: '??????????????????????'}, {id: 1, caption: '??????????????'}, {id: 2, caption: '??????????'}, {
        id: 3,
        caption: '??????????????'
      },
        {id: 4, caption: '??????????????'}, {id: 5, caption: '??????????????'}, {id: 6, caption: '??????????????????????'}]);
    } else if (lookupNameLower === 'security-role') {
      this.metadataService.getAllRoles().subscribe(val => {
        existing.next(val);
      });
    } else if (lookupNameLower === 'security-function') {
      this.metadataService.getAllFunctions().subscribe(val => {
        existing.next(val);
      });
    } else {
      this.metadataService.getMetadata(lookupNameLower).subscribe(val => existing.next(val));
    }
  }

  private preloadTwoLevelLookup(lookupName: string, firstLevelLookupName: string, branchFieldName: string,
                                idFieldName: string, existing: Subject<any[]>) {
    const lookupNameLower = lookupName ? lookupName.toLowerCase() : lookupName;
    const firstLevelLookupNameLower = firstLevelLookupName ? firstLevelLookupName.toLowerCase() : '';
    const dictionary = this.dataCachingService.getCachedData('PreloadTwoLevelLookup', firstLevelLookupNameLower);

    const load = (val) => {
      const entityType = lookupName.substr(firstLevelLookupNameLower.length)
        ? lookupName.substr(firstLevelLookupNameLower.length)
        : undefined;
      const allLookupObj = {};

      val.forEach(item => {
        if (!allLookupObj[item[branchFieldName]]) {
          allLookupObj[item[branchFieldName]] = [];
        }
        const cloned = {id: item[idFieldName]};
        Object.assign(cloned, item);
        allLookupObj[item[branchFieldName]].push(cloned);
      });

      for (const key in allLookupObj) {
        if (key && entityType && key.toLowerCase() == entityType.toLowerCase()) {
          existing.next(allLookupObj[key]);
        } else {
          const byEntityTypeSubj = new ReplaySubject();
          this.dataCachingService.addToCache('LookupSourceService', firstLevelLookupName + key, byEntityTypeSubj, 200);
          byEntityTypeSubj.next(allLookupObj[key]);
        }
      }

      if (lookupNameLower === firstLevelLookupName) {
        existing.next(allLookupObj as any[]);
      } else {
        const allSubj = new ReplaySubject();
        this.dataCachingService.addToCache('LookupSourceService', firstLevelLookupName, allSubj, 200);
        allSubj.next(allLookupObj);
      }
    };
    if (dictionary) {
      load(dictionary);
    } else {
      this.metadataService.getMetadata(firstLevelLookupNameLower).subscribe(val => {
        this.dataCachingService.addToCache('PreloadTwoLevelLookup', firstLevelLookupNameLower, val);
        load(val);
      });
    }
  }
}
