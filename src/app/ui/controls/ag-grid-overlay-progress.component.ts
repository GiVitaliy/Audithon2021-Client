import { Component } from "@angular/core";
import { ILoadingOverlayAngularComp } from "ag-grid-angular";

@Component({
  selector: 'app-ag-grid-overlay-progress',
  template: `
      <div style="background-color: white; padding: 10px; border: 1px solid silver; border-radius: 5px">

          <h3 class="modal-title" style="padding-bottom: 10px">Ожидание выполнения операции</h3>

          <div class="modal-body">
              <div>
                  <div style="display: flex; flex-direction: row; align-items: center">
                      <clr-icon shape="hourglass" class="is-solid" size="70" style="margin: 0 10px 0 10px; flex: 1 0 auto"></clr-icon>
                      <div style="flex: 1000 1 auto">

                          <div>
                              Выполняется длительная операция
                          </div>

                          <div class="progress labeled">
                              <progress max="100" value="{{percentProgress}}" data-displayval="0%"></progress>
                              <span>{{percentProgress}}%</span>
                          </div>

                          <div>
                              {{message}}
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <div class="modal-footer itech-form-actions">
              <div>
              </div>
              <div>
                  <button type="button" class="btn btn-link" (click)="cancel()">
                      <clr-icon shape="times"></clr-icon>&nbsp;Отмена
                  </button>
              </div>
          </div>

      </div>`
})
export class AgGridOverlayProgressComponent implements ILoadingOverlayAngularComp {

  /**
   * Так как в данном фреймворке я не нашел метод, позволяющий отобразить шаблон данного фреймворка,
   * то перед началом процесса загрузки данных в основном компоненте необходимо вызвать gridApi.showLoadingOverlay() и AgGridOverlayProgressComponent.reset(),
   * а скроется окно с процессом загрузки самостоятельно по окончанию загрузки либо при прерывании пользователем
  **/

  static params: any;
  static currentIndex: number;
  static allCount: number;
  static isCanceled = false;

  agInit(params): void {
    AgGridOverlayProgressComponent.params = params;
    AgGridOverlayProgressComponent.currentIndex = 1;
    AgGridOverlayProgressComponent.allCount = 1;
  }

  get currentIndex() {
    return AgGridOverlayProgressComponent.currentIndex;
  }

  get allCount() {
    return AgGridOverlayProgressComponent.allCount;
  }

  get message() {
    return this.allCount > 1 ? 'Обработано ' + this.currentIndex + ' строк из ' + this.allCount : 'Загрузка...';
  }

  get percentProgress() {
    return this.allCount > 1 ? Math.floor(this.currentIndex * 100 / this.allCount) : 0;
  }

  cancel() {
    AgGridOverlayProgressComponent.isCanceled = true;
    AgGridOverlayProgressComponent.params.api.hideOverlay();
  }

  /**
   * Обновит данные в окне с процессом загрузки
   *
   * @param callback - функция, которая выполняется для каждой строки
   *                   должна вернуть строку, которая добавится в allData
   * @param allData - все ранее обработанные строки
   * @param allCount - общее количество обрабатываемых строк
  **/
  static update(callback: () => any, allData: any[], allCount: number) {

    // если объем строк большой, то интерфейс без таймута перестает откликаться
    setTimeout(() => {

      if (this.isCanceled) {
        if (this.params.api.getDisplayedRowCount() != allData.length) {
          this.currentIndex = 1;
          this.allCount = 1;

          this.params.api.setRowData(allData);
          this.params.api.hideOverlay();
        }
      } else {

        allData.push(callback());

        this.currentIndex = allData.length;
        this.allCount = allCount;

        if (allData.length == allCount) {
          this.params.api.setRowData(allData);
          this.params.api.hideOverlay();
          this.reset();
        }
      }
    }, 5);
  }

  static reset() {
    this.isCanceled = false;
    this.currentIndex = 1;
    this.allCount = 1;
  }
}
