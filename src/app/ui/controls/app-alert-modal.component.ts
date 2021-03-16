import { Component } from '@angular/core';
import { AlertService } from '../infrastructure/alert.service';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './app-alert-modal.component.html'
})
export class AppAlertModalComponent {

  constructor(public alertService: AlertService) {

  }

  acceptModal() {
    this.alertService.alertModalAcceptPromise.next(true);
    this.alertService.alertModalOpened = false;
  }
}
