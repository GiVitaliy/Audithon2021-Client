import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, noop, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';
import { GroupOperationReportsMetadataService } from './group-operation-reports-metadata.service';
import { AppVersionHistory } from '../../app.version-history';
import { AppNavigationService } from './app-navigation.service';

/**
 * Для применения настроек отображения конкретного компонента страницы используй
 * userSettingService.getSetting('@namePage', '@nameComponent').@field
 * @namePage: string - наименование страницы, на которой расположен компонент
 * @nameComponent: string - наименование компонента
 * @field: property - параметр (конкретное поле компонента)
 * return: в соответствии с настройками для данного пользователя
 *        true - показать
 *        false - скрыть
 **/
@Injectable()
export class UserSettingService {

  // эти параметры не подлежат изменению, они устанавливается автоматически из роли пользователя
  public visibleAdministrationBlock = false;
  public visibleObserverIpra = false;

  private userSettingUi$: BehaviorSubject<any>;
  private reportGroupsAccordingWithSetUi$ = new BehaviorSubject<any[]>([]);
  public navCollapsed$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient,
              private fb: FormBuilder,
              private groupOperationReportsMetadataService: GroupOperationReportsMetadataService,
              private appVersionHistory: AppVersionHistory,
              private appNavigationService: AppNavigationService) {
    this.getSettingsFromServer$();
  }

  private static defaultValueLayout(fb: FormBuilder) {
    return {
      sidebar: fb.group({
        home: true,
        institution: true,
        query: true,
        paymentDocs: true,
        orders: true
      })
    };
  }

  private static defaultValueEditPerson(fb: FormBuilder) {
    return {
      tabs: fb.group({
        common: true,
        docs: true,
        request: true,
        service: true,
        ipra: true,
        payment: true,
        scan: true,
        ipraResult: true
      })
    };
  }

  private static defaultValueDashboard(fb: FormBuilder) {
    return {
      create: fb.group({
        newPerson: true,
        newInstitution: true
      }),
      query: fb.group({
        servicesCostTotal: true,
        servicesCostDetailed: true,
        stateOrder: true
      })
    };
  }

  private static defaultValueJobs(fb: FormBuilder) {
    return [];
  }

  static getDefaultValue(fb: FormBuilder, namePage: string, nameComponent?: string) {

    let resultDefaultValue;

    switch (namePage) {

      case 'layout':
        resultDefaultValue = nameComponent ?
          UserSettingService.defaultValueLayout(fb)[nameComponent] : UserSettingService.defaultValueLayout(fb);
        break;

      case 'editPerson':
        resultDefaultValue = nameComponent ?
          UserSettingService.defaultValueEditPerson(fb)[nameComponent] : UserSettingService.defaultValueEditPerson(fb);
        break;

      case 'jobs':
        resultDefaultValue = UserSettingService.defaultValueJobs(fb);
        break;

      case 'dashboard':
        resultDefaultValue = nameComponent ?
          UserSettingService.defaultValueDashboard(fb)[nameComponent] : UserSettingService.defaultValueDashboard(fb);
        break;

      default:
        resultDefaultValue = true;
    }

    return resultDefaultValue;
  }

  public getSettingsFromServer$(): Observable<any> {

    if (!this.userSettingUi$) {
      this.userSettingUi$ = new BehaviorSubject<any>({});
    }

    return this.userSettingUi$;
  }

  private applySettingToUi(userSettingUi: any) {
    this.userSettingUi$.next(userSettingUi);
    this.visibleAdministrationBlock = userSettingUi.visibleAdministrationBlock
      ? userSettingUi.visibleAdministrationBlock : false;
    this.visibleObserverIpra = userSettingUi.visibleObserverIpra ? userSettingUi.visibleObserverIpra : false;
    this.loadAvailableReportData();
    this.checkVersionLastSession();
  }

  public refreshSetting() {
    this.userSettingUi$ = undefined;

    this.getSettingsFromServer$().subscribe(noop);
  }

  public storeUserSettings(settings: any) {

    const qstring = environment.api + '/security/user-setting/store';

    return this.http.post(qstring, settings.value)
      .pipe(map((response: any) => {
        this.applySettingToUi(settings.value);
        return response as any;
      }));
  }

  // метод возвращает настройки отображения для |страницы/компонента страницы|,
  // если некоторые настройки отсутствуют, то он добавит их с настройками по умолчанию
  // если настройки вообще отсутствуют, то он вернет настройки по умолчанию
  public getSetting(namePage: string, nameComponent: string) {

    if (!Object.keys(this.userSettingUi$.value).length) {
      return UserSettingService.getDefaultValue(this.fb, namePage, nameComponent).value;
    }

    return (this.userSettingUi$.value[namePage] && this.userSettingUi$.value[namePage][nameComponent]) ?
      this.compareProperties(this.userSettingUi$.value,
        UserSettingService.getDefaultValue(this.fb, namePage, nameComponent).value, namePage, nameComponent)
      : UserSettingService.getDefaultValue(this.fb, namePage, nameComponent).value;
  }

  public getSettingForEdit(namePage: string) {

    if (!Object.keys(this.userSettingUi$.value).length) {
      return this.fb.group(UserSettingService.getDefaultValue(this.fb, namePage));
    }

    return this.fb.group(this.userSettingUi$.value[namePage] ?
      this.userSettingUi$.value[namePage] : UserSettingService.getDefaultValue(this.fb, namePage));
  }

  public getSettingForEditArray(namePage: string) {

    if (!Object.keys(this.userSettingUi$.value).length) {
      return this.fb.array(UserSettingService.getDefaultValue(this.fb, namePage));
    }

    return this.fb.array(this.userSettingUi$.value[namePage] ?
      this.userSettingUi$.value[namePage] : UserSettingService.getDefaultValue(this.fb, namePage));
  }

  private compareProperties(val: any, defaultValue: any, namePage: string, nameComponent?: string) {

    const prop = Object.keys(defaultValue);
    const currentProp = Object.keys(nameComponent ? val[namePage][nameComponent] : val[namePage]);

    if (!prop.length || prop.length === currentProp.length) {
      return nameComponent ? val[namePage][nameComponent] : val[namePage];
    }

    if (nameComponent) {
      for (let i = 0; i < prop.length; i++) {
        if (!val[namePage][nameComponent].hasOwnProperty(prop[i])) {
          val[namePage][nameComponent][prop[i]] = true;
        }
      }

      return val[namePage][nameComponent];

    } else {
      for (let i = 0; i < prop.length; i++) {
        if (!val[namePage].hasOwnProperty(prop[i])) {
          val[namePage][prop[i]] = true;
        }
      }

      return val[namePage];
    }
  }

  private loadAvailableReportData() {

    this.userSettingUi$.subscribe(setUi => {
      this.groupOperationReportsMetadataService.getMassReportGroups$().subscribe(massReportGroup => {

        const existing = [];
        massReportGroup.forEach(massReport => existing.push(Object.assign({}, massReport)));

        existing.forEach(group => {
          group.reports = group.reports.filter(report =>
            !this.userSettingUi$.getValue().jobs || !this.userSettingUi$.getValue().jobs.includes(report.id));
        });

        const reportGroupsAccordingSetUi = existing.filter(group => group.reports.length);

        this.reportGroupsAccordingWithSetUi$.next(reportGroupsAccordingSetUi);
      });
    });
  }

  public getReportData$(): Observable<any[]> {
    return this.reportGroupsAccordingWithSetUi$;
  }

  private checkVersionLastSession() {
    const lastVersion = localStorage.getItem('last-session-version');

    if (!lastVersion || this.appVersionHistory.versions[0].version !== lastVersion) {
      this.appNavigationService.versionHistoryOpened = true;
    }

    localStorage.setItem('last-session-version', this.appVersionHistory.versions[0].version);
  }

  public toggleNavCollapsed() {
    this.navCollapsed$.next(!this.navCollapsed$.value);
  }
}
