import { Component } from '@angular/core';
import { JobRunnerUiService } from '../infrastructure/job-runner-ui.service';

@Component({
  selector: 'app-job-runner-modal',
  template: `
    <clr-modal *ngIf="model.state && !model.completed"
               [(clrModalOpen)]="model.state && !model.completed" [clrModalClosable]="false">

      <h3 class="modal-title">Ожидание выполнения операции</h3>

      <div class="modal-body">
        <div>
          <div style="display: flex; flex-direction: row; align-items: center">
            <clr-icon shape="hourglass" class="is-solid" size="70" style="margin: 0 10px 0 10px; flex: 1 0 auto"></clr-icon>
            <div style="flex: 1000 1 auto">

              <div>
                Выполняется длительная операция
              </div>

              <div class="progress labeled">
                <progress max="10000" value="{{model.state.progress}}" data-displayval="0%"></progress>
                <span>{{jobRunnerUiService.getPercProgress()}}%</span>
              </div>

              <div>
                {{model.state.message}}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer itech-form-actions">
        <div>
        </div>
        <div>
          <button type="button" class="btn btn-link" (click)="jobRunnerUiService.cancelOperation()">
            <clr-icon shape="times"></clr-icon>&nbsp;Отмена
          </button>
        </div>
      </div>

    </clr-modal>
  `
})
export class JobRunnerModalComponent {

  public get model() {
    return this.jobRunnerUiService.model;
  }

  constructor(public jobRunnerUiService: JobRunnerUiService) {
  }
}
