import { Component } from '@angular/core';
import { AlertService } from '../infrastructure/alert.service';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './app-confirm-modal.component.html'
})
export class AppConfirmModalComponent {

  public selectedCheckboxConfirmAction = false;

  constructor(public alertService: AlertService) {

  }

  acceptModal() {
    this.alertService.confirmModalAcceptPromise.next(true);
    this.alertService.confirmModalOpened = false;
  }
}
