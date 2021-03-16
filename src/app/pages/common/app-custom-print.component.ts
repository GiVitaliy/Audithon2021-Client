import {Component, ViewChildren} from '@angular/core';
import {AppNavigationService} from '../../logic/services/app-navigation.service';
import {ILogger, LoggerFactory} from '../../logger/logger.factory';
import {AppCustomPrintHostDirective} from '../../ui/controls/app-custom-print-host.directive';
import {IPrintData} from '../../logic/services/app-navigation.service.models';

@Component({
  selector: 'app-custom-print',
  queries: {
    viewChildren: new ViewChildren(AppCustomPrintHostDirective)
  },
  template: `
    <ng-container [appCustomPrintHost]="navigationService.customPrintComponent"
                  [appCustomPrintHostOnBodyCreate]="onBodyComponentCreate">
    </ng-container>`
})
export class AppCustomPrintComponent {
  private logger: ILogger;
  onBodyComponentCreate: (body: IPrintData<any>) => {};

  constructor(public navigationService: AppNavigationService, loggerFactory: LoggerFactory) {
    const self = this;
    this.onBodyComponentCreate = (body: IPrintData<any>) => body.initPrintData(self.navigationService.customPrintParams);

    this.logger = loggerFactory.getLogger('AppCustomPrintComponent');
    this.navigationService.customPrintReady.subscribe(() => {
      window.print();

      setTimeout(() => {
        this.navigationService.customPrintComponent = undefined;
        this.navigationService.customPrintParams = undefined;
      }, 0);

    });
  }
}
