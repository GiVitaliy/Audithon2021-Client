export class AgGridHelper  {

  public static getNoDecorationsTemplate(): string {
    return '<div class="ag-cell-label-container" role="presentation">' +
      '  <div ref="eLabel" class="ag-header-cell-label" role="presentation">' +
      '    <span ref="eText" class="ag-header-cell-text" role="columnheader"></span>' +
      '  </div>' +
      '</div>';
  }
}
