import {Component, ViewChildren} from '@angular/core';
import {AppNavigationService} from '../../logic/services/app-navigation.service';
import {AppCustomModalHostDirective} from '../../ui/controls/app-custom-modal-host.directive';
import {QueryList} from '@angular/core/src/render3';
import {ILogger, LoggerFactory} from '../../logger/logger.factory';
import {IModalBody, ModalResult} from '../../logic/services/app-navigation.service.models';

@Component({
  selector: 'app-custom-modal',
  queries: {
    viewChildren: new ViewChildren(AppCustomModalHostDirective)
  },
  templateUrl: './app-custom-modal.component.html'
})
export class AppCustomModalComponent {
  viewChildren: QueryList<AppCustomModalHostDirective>;
  onBodyComponentCreate: (body: IModalBody<any, any>) => {};

  private logger: ILogger;

  constructor(public navigationService: AppNavigationService, loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.getLogger('AppCustomModalComponent');
    const self = this;
    this.onBodyComponentCreate = (body: IModalBody<any, any>) => body.initModalBody(self.navigationService.customModalParams);
  }

  acceptModal() {
    const bodyComponent = (this.viewChildren.first as AppCustomModalHostDirective).bodyComponent as IModalBody<any, any>;
    this.logger.debug('bodyComponent', bodyComponent);

    if (bodyComponent) {
      this.navigationService.customModalAcceptPressed = true;

      bodyComponent.onModalAccept$().subscribe((modalResult: ModalResult<any>) => {
          if (modalResult.succeed) {
            this.navigationService.customModalOpened = false;
            this.navigationService.customModalAcceptExternalPromise.next(modalResult.data);
          }
        },
        (error) => {
          this.logger.error(error);
          this.navigationService.customModalAcceptPressed = false;
        }, () => {
          this.navigationService.customModalAcceptPressed = false;
        });
    } else {
      this.logger.error('Не удалось получить компонент содержимого модального окна');
      this.navigationService.customModalAcceptPressed = true;
      // this.navigationService.customModalAcceptInternalPromise.next(true);
    }
  }

  onInputKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.acceptModal();
    }
  }
}
