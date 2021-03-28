import { Component, OnInit } from '@angular/core';
import { AppNavigationService } from '../../../logic/services/app-navigation.service';
import { AgGridLocalization } from '../../../ui/controls/ag-grid-localization';
import { IndicatorUiService } from '../../../logic/services/indicator-ui.service';
import { LookupSourceService } from '../../../logic/services/lookup-source.service';
import { RowNode } from 'ag-grid-community';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  agGridLocaleTextFunc = AgGridLocalization.getLocalization;

  public defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  public forcedFocusedId;

  public shouldRenderGrid = true;
  public shouldRenderChart = true;

  private gridApi: any;

  getContextMenuItems = (() => {
    const self = this;
    return (params) => {

      const fieldname = params.column ? params.column.colDef.field : undefined;

      if (fieldname && fieldname.startsWith('val')) {

        const retVal = [];

        const indicator = self.indicatorUiService.selectedIndicators[+(fieldname.substring(3))];

        retVal.push({
          disabled: self.indicatorUiService.mapIndicator === indicator,
          name: 'Отобразить на карте',
          action: function () {
            self.indicatorUiService.selectMapIndicator(indicator);

            setTimeout(() => params.api.redrawRows({}), 0);
          }
        });

        retVal.push('separator');

        if (self.indicatorUiService.isIndicatorOnChart(indicator, params.node.data.stateId)) {
          retVal.push({
            name: 'Удалить из графика',
            action: function () {
              self.indicatorUiService.removeChartIndicator(
                indicator,
                params.node.data.stateId);
              setTimeout(() => params.api.redrawRows({}), 0);
            }
          });
        } else {
          retVal.push({
            name: 'Отобразить на графике (левая ось)',
            action: function () {
              self.indicatorUiService.addChartIndicator(
                indicator,
                params.node.data.stateId,
                params.node.data.stateCaption,
                'y-axis-0');
              setTimeout(() => params.api.redrawRows({}), 0);
            }
          });
          retVal.push({
            name: 'Отобразить на графике (правая ось)',
            action: function () {
              self.indicatorUiService.addChartIndicator(
                indicator,
                params.node.data.stateId,
                params.node.data.stateCaption,
                'y-axis-1');

              setTimeout(() => params.api.redrawRows({}), 0);
            }
          });
        }
        retVal.push('separator');

        retVal.push({
          name: 'Удалить показатель',
          action: function () {
            self.indicatorUiService.deleteIndicator(indicator);
          }
        });

        retVal.push('separator');
        retVal.push('excelExport');

        return retVal;
      }
    };
  })();

  constructor(public appNavigationService: AppNavigationService,
              public lookupSourceService: LookupSourceService,
              public indicatorUiService: IndicatorUiService) {
  }

  ngOnInit(): void {

    this.indicatorUiService.gridRedrawRequired.subscribe(() => this.redrawGrid());
    this.indicatorUiService.chartRedrawRequired.subscribe(() => this.redrawChart());

    this.indicatorUiService.addIndicator2(1000003, 12, 2020, 'valueMa');
  }

  onGridReady(params) {
    this.gridApi = params.api;
  }

  onCellDoubleClicked(params) {

    const fieldname = params.column ? params.column.colDef.field : undefined;

    if (fieldname) {
      const indicator = this.indicatorUiService.selectedIndicators[+(fieldname.substring(3))];

      if (!indicator) {
        return;
      }

      if ((params.event.ctrlKey || params.event.shiftKey) &&
        this.indicatorUiService.isIndicatorOnChart(indicator, params.node.data.stateId)) {
        this.indicatorUiService.removeChartIndicator(
          indicator,
          params.node.data.stateId);
        setTimeout(() => params.api.redrawRows({}), 0);
      } else if (params.event.ctrlKey) {
        this.indicatorUiService.addChartIndicator(
          indicator,
          params.node.data.stateId,
          params.node.data.stateCaption,
          'y-axis-0');
        setTimeout(() => params.api.redrawRows({}), 0);
      } else if (params.event.shiftKey) {
        this.indicatorUiService.addChartIndicator(
          indicator,
          params.node.data.stateId,
          params.node.data.stateCaption,
          'y-axis-1');
        setTimeout(() => params.api.redrawRows({}), 0);
      } else if (this.indicatorUiService.mapIndicator !== indicator) {
          this.indicatorUiService.selectMapIndicator(indicator);
          setTimeout(() => params.api.redrawRows({}), 0);
        }
    }
  }

  moClicked(stateId) {
    this.gridApi.ensureNodeVisible((node: RowNode) => {
      const isSelectedState = node.data.stateId === stateId;
      if (isSelectedState) {
        node.setSelected(true);
      }
      return isSelectedState;
    }, 'top');
  }

  onRowSelected(params) {
    if (params.node.selected) {
      this.forcedFocusedId = params.data.stateId;
    }
  }

  getRowStyle(params) {
    // if (params.data && !params.data.enabled) {
    //   return {color: 'silver'};
    // }
  }

  private redrawGrid() {
    this.shouldRenderGrid = false;
    setTimeout(() => {
      this.shouldRenderGrid = true;
    }, 100);
  }

  private redrawChart() {
    this.shouldRenderChart = false;
    setTimeout(() => {
      this.shouldRenderChart = true;
    }, 100);
  }

  onMapModeChange() {
    this.indicatorUiService.updateDataColors();
  }
}
