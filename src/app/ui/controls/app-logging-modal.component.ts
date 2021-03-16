import { Component } from '@angular/core';
import { JobRunnerUiService } from '../infrastructure/job-runner-ui.service';

@Component({
  selector: 'app-logging-modal',
  template: `
    <clr-modal [(clrModalOpen)]="modalOpen" [clrModalClosable]="false">

      <div class="modal-body">
        <div>
          <div style="display: flex; flex-direction: row; align-items: center">
            <clr-icon shape="hourglass" class="is-solid" size="70" style="margin: 0 10px 0 10px; flex: 1 0 auto"></clr-icon>
            <div style="flex: 1000 1 auto">
              <h3 style="margin-top: 0">Проверка данных пользователя</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer itech-form-actions">
      </div>

    </clr-modal>
  `
})
export class AppLoggingModalComponent {
  modalOpen = true;
}
