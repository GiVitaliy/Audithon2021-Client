import { Injectable } from '@angular/core';
import { MetadataService } from './metadata.service';
import { DataCachingService } from './data-caching.service';
import { Observable, Subject, BehaviorSubject, ReplaySubject } from 'rxjs';
import { StringHelper } from '../../helpers/string-helper';
import { first, map, switchMap } from 'rxjs/internal/operators';
import { DateHelper } from '../../helpers/date-helper';
import { AppConstants } from '../../app-constants';
import { of } from 'rxjs/internal/observable/of';
import { isArray } from 'rxjs/internal/util/isArray';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

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
      throw new Error('getLookupObj для addr-street не работает');
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
    } else if (lookupNameLower.startsWith('sys-query-view')) {
      this.preloadTwoLevelLookup(lookupNameLower, 'sys-query-view', 'entityType', 'id', existing);
    } else if (lookupNameLower.startsWith('request-type-subject')) {
      this.preloadTwoLevelLookup(lookupNameLower, 'request-type-subject', 'requestTypeId', 'id', existing);
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
      existing.next([{id: true, caption: 'Муж'}, {id: false, caption: 'Жен'}]);
    } else if (lookupNameLower === 'person-group-visibility') {
      existing.next([{id: 1, caption: 'Глобально'}, {id: 2, caption: 'Учреждение'}, {id: 3, caption: 'Пользователь'}]);
    } else if (lookupNameLower === 'journal-change-type') {
      existing.next([
        {id: 1, caption: 'Добавление'},
        {id: 2, caption: 'Редактирование'},
        {id: 3, caption: 'Удаление'},
        {id: 4, caption: 'Получение доступа'},
        {id: 5, caption: 'Предоставление доступа пользователю'},
        {id: 6, caption: 'Передача дела'}
      ]);
    } else if (lookupNameLower === 'app-months') {
      existing.next([
        {id: 1, caption: 'Январь'},
        {id: 2, caption: 'Февраль'},
        {id: 3, caption: 'Март'},
        {id: 4, caption: 'Апрель'},
        {id: 5, caption: 'Май'},
        {id: 6, caption: 'Июнь'},
        {id: 7, caption: 'Июль'},
        {id: 8, caption: 'Август'},
        {id: 9, caption: 'Сентябрь'},
        {id: 10, caption: 'Октябрь'},
        {id: 11, caption: 'Ноябрь'},
        {id: 12, caption: 'Декабрь'},
      ]);
    } else if (lookupNameLower === 'app-indicator-modes') {
      existing.next([{id: 'value', caption: 'Первичное'},
        {id: 'valueMa', caption: 'Скользящее ср.', shortCaption: 'MA'},
        {id: 'valueMaTrend', caption: 'Ск.ср. тренд', shortCaption: 'MA\''},
        {id: 'valueMaTrendX2', caption: 'Ск.ср. тренд 2x', shortCaption: 'MA\'\''}]);
    } else if (lookupNameLower === 'app-years') {
      existing.next([{id: 2018, caption: '2018'},
        {id: 2019, caption: '2019'},
        {id: 2020, caption: '2020'}]);
    } else if (lookupNameLower === 'report-period-mode') {
      existing.next([{id: 1, caption: 'За месяц'}, {id: 2, caption: 'За квартал'}]);
    } else if (lookupNameLower === 'rsdp-export-mode') {
      existing.next([{id: 1, caption: 'РЕГСФР'}, {id: 2, caption: 'ЗАПРОС'}]);
    } else if (lookupNameLower === 'smev-message-status') {
      existing.next([{id: 1, caption: 'В работе'},
        {id: 2, caption: 'Временное предупреждение'},
        {id: 3, caption: 'Успешно выполнено'},
        {id: 4, caption: 'Выполнено с ошибками'}]);
    } else if (lookupNameLower === 'report-output-format') {
      existing.next([{id: 'odt', caption: 'XDocReport Open Document (.odt)'},
        {id: 'odtPdf', caption: 'XDocReport PDF .odt'},
        {id: 'jasperPdf', caption: 'JasperReports PDF .jrxml'},
        {id: 'jasperXlsx', caption: 'JasperReports Xls .jrxml'},
        {id: 'jasperDocx', caption: 'JasperReports Docx .jrxml'},
        {id: 'customCsv', caption: 'Comma-Separated Values (.csv)'},
        {id: 'xlsx', caption: 'Excel .xlsx'}]);
    } else if (lookupNameLower === 'daily-schedule-kind') {
      existing.next([{id: 1, caption: 'Ежедневно'}, {id: 2, caption: 'Еженедельно'}, {id: 3, caption: 'Ежемесячно'}]);
    } else if (lookupNameLower === 'security-function-scope') {
      existing.next([{id: 10, caption: 'Все объекты'}, {id: 20, caption: 'Объекты, связанные с курирующим учреждением'},
        {id: 30, caption: 'Объекты, связанные с учреждением'},
        {id: 40, caption: 'Объекты пользователей учреждения'}, {id: 50, caption: 'Объекты пользователя'}]);
    } else if (lookupNameLower === 'week-days') {
      existing.next([{id: 0, caption: 'Понедельник'}, {id: 1, caption: 'Вторник'}, {id: 2, caption: 'Среда'}, {
        id: 3,
        caption: 'Четверг'
      },
        {id: 4, caption: 'Пятница'}, {id: 5, caption: 'Суббота'}, {id: 6, caption: 'Воскресенье'}]);
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
      const entityType = lookupNameLower.substr(firstLevelLookupNameLower.length)
        ? parseInt(lookupNameLower.substr(firstLevelLookupNameLower.length), 10)
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
        if (parseInt(key, 10) === entityType) {
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
