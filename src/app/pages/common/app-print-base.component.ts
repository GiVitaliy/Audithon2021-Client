import {AlertService} from '../../ui/infrastructure/alert.service';
import {AppNavigationService} from '../../logic/services/app-navigation.service';
import {AfterViewChecked, EventEmitter} from '@angular/core';
import {debounceTime} from 'rxjs/internal/operators';

export abstract class AppPrintBaseComponent implements AfterViewChecked {
  // компонент предназначен для показа в общем контейнере компонента печатного режима,
  // должен отслеживать подгрузку всех данных и общую готовность к печати и сообщать об этом компоненту-контейнеру
  // посредством navigationService
  allContentDone = new EventEmitter<any>();

  protected constructor(protected alertService: AlertService, protected navigationService: AppNavigationService) {
    let countForShare = 0;
    let printed = false;
    this.alertService.activeHttpRequests.subscribe(count => {
      countForShare = count;
      this.allContentDone.emit();
    });
    this.allContentDone.pipe(debounceTime(500)).subscribe(() => {
      if (countForShare === 0 && !printed) {
        printed = true;
        this.navigationService.customPrintReady.emit();
      }
    });
  }

  ngAfterViewChecked() {
    this.allContentDone.emit();
  }
}
