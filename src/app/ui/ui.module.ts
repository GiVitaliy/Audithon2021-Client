import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RDatePipe } from './pipes/r-date.pipe';
import { RTimePipe } from './pipes/r-time.pipe';
import { LookupSourcePipe } from '../logic/pipes/lookup-source.pipe';
import { RawLookupSourcePipe } from '../logic/pipes/raw-lookup-source.pipe';
import { AppValidationTooltipComponent } from './controls/app-validation-tooltip.component';
import { AppComboLookupComponent } from './controls/app-combo-lookup.component';
import { AppConfirmModalComponent } from './controls/app-confirm-modal.component';
import { AppTreeNodesComponent } from './controls/app-tree-nodes.component';
import { AppTreeComponent } from './controls/app-tree.component';
import { RMonthPipe } from './pipes/r-month.pipe';
import { RMonthSPipe } from './pipes/r-month-s.pipe';
import { AppCustomModalHostDirective } from './controls/app-custom-modal-host.directive';
import { AppReportsButtonComponent } from './controls/app-reports-button.component';
import { AppSelectInstitutionServiceComponent } from './controls/app-select-institution-service.component';
import { AppChooseTreeNodesComponent } from './controls/app-choose-tree-nodes.component';
import { ClickOutsideModule } from 'ng-click-outside';
import { AppCheckboxSelectComponent } from './controls/app-checkbox-select.component';
import { AppDatetimePickerComponent } from './controls/app-datetime-picker.component';
import { AppTextLookupComponent } from './controls/app-text-lookup.component';
import { AppAlertModalComponent } from './controls/app-alert-modal.component';
import { AppCheckboxItemsComponent } from './controls/app-checkbox-items.component';
import { FilterPipe } from './pipes/filter.pipe';
import { AppCustomPrintHostDirective } from './controls/app-custom-print-host.directive';
import { AppComboMultilookupComponent } from './controls/app-combo-multilookup.component';
import {SafeHtmlBreaksPipe} from '../logic/pipes/safe-html-breaks.pipe';
import { AppLoggingModalComponent } from './controls/app-logging-modal.component';

@NgModule({
  imports: [
    CommonModule,
    ClarityModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ClickOutsideModule
  ],
  declarations: [
    RDatePipe,
    RMonthPipe,
    RMonthSPipe,
    RTimePipe,
    FilterPipe,
    LookupSourcePipe,
    RawLookupSourcePipe,
    SafeHtmlBreaksPipe,
    AppValidationTooltipComponent,
    AppComboLookupComponent,
    AppConfirmModalComponent,
    AppAlertModalComponent,
    AppTreeNodesComponent,
    AppTreeComponent,
    AppCustomModalHostDirective,
    AppReportsButtonComponent,
    AppSelectInstitutionServiceComponent,
    AppChooseTreeNodesComponent,
    AppCheckboxSelectComponent,
    AppCheckboxItemsComponent,
    AppDatetimePickerComponent,
    AppTextLookupComponent,
    AppCustomPrintHostDirective,
    AppComboMultilookupComponent,
    AppLoggingModalComponent,
  ],
  exports: [
    RDatePipe,
    RMonthPipe,
    RMonthSPipe,
    RTimePipe,
    FilterPipe,
    LookupSourcePipe,
    RawLookupSourcePipe,
    SafeHtmlBreaksPipe,
    AppValidationTooltipComponent,
    AppComboLookupComponent,
    AppConfirmModalComponent,
    AppAlertModalComponent,
    AppTreeNodesComponent,
    AppTreeComponent,
    AppReportsButtonComponent,
    AppSelectInstitutionServiceComponent,
    AppChooseTreeNodesComponent,
    AppCheckboxSelectComponent,
    AppCheckboxItemsComponent,
    AppCustomModalHostDirective,
    AppCustomPrintHostDirective,
    AppDatetimePickerComponent,
    AppTextLookupComponent,
    AppComboMultilookupComponent,
    AppLoggingModalComponent,
  ],
})
export class UiModule {
}
