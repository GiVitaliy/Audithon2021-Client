import { NgModule } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { DashboardComponent } from './layout/dashboard/dashboard.component';
import { UiModule } from '../ui/ui.module';
import { ServerSideErrorsValidatorDirective } from '../logic/validators/server-side-errors-validator.directive';
import { GroupOperationsBrowseComponent } from './common/group-operations-browse.component';
import { UnavailableComponent } from './common/unavailable.component';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './layout/header/header.component';
import { MainComponent } from './layout/main/main.component';
import { AppCustomModalComponent } from './common/app-custom-modal.component';
import { ClarityModule } from '@clr/angular';
import { VersionHistoryComponent } from './layout/version-history/version-history.component';
import { AppGridSelectEditorComponent } from '../ui/controls/app-grid-select-editor.component';
import { AppGridDateEditorComponent } from '../ui/controls/app-grid-date-editor.component';
import { AppGridNumberEditorComponent } from '../ui/controls/app-grid-number-editor.component';
import { LogsDownloadComponent } from './system/logs-download.component';
import { AgGridLookupRendererComponent } from '../ui/controls/ag-grid-lookup-renderer.component';
import { ModalDateFromToComponent } from '../ui/controls/modal-date-from-to.component';
import { ModalTextStringComponent } from '../ui/controls/modal-text-string.component';
import { ModalTwoTextStringComponent } from '../ui/controls/modal-two-text-string.component';
import { JobScheduleBrowseComponent } from './dictionary/common/job-schedule-browse.component';
import { JobRunnerModalComponent } from '../ui/controls/job-runner-modal.component';
import { ModalSelectItemsComponent } from '../ui/controls/modal-select-items.component';
import { ModalDateComponent } from '../ui/controls/modal-date.component';
import { AppCustomPrintComponent } from './common/app-custom-print.component';
import { AgGridCheckboxRendererComponent } from '../ui/controls/ag-grid-checkbox-renderer.component';
import { TelemetryComponent } from './admin/telemetry.component';
import { ChartsModule } from 'ng2-charts';
import { AgGridOverlayProgressComponent } from '../ui/controls/ag-grid-overlay-progress.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ClarityModule,
    UiModule,
    AgGridModule.withComponents([AppGridSelectEditorComponent, AppGridDateEditorComponent, AppGridNumberEditorComponent]),
    ChartsModule,
  ],
  providers: [Location],
  declarations: [
    LayoutComponent,
    HeaderComponent,
    MainComponent,
    DashboardComponent,
    ServerSideErrorsValidatorDirective,
    GroupOperationsBrowseComponent,
    UnavailableComponent,
    AppCustomModalComponent,
    AppCustomModalComponent,
    VersionHistoryComponent,
    AppGridSelectEditorComponent,
    AppGridDateEditorComponent,
    AppGridNumberEditorComponent,
    AppGridDateEditorComponent,
    LogsDownloadComponent,
    ModalDateFromToComponent,
    ModalDateComponent,
    ModalTextStringComponent,
    ModalTwoTextStringComponent,
    JobScheduleBrowseComponent,
    AgGridLookupRendererComponent,
    AgGridCheckboxRendererComponent,
    AgGridOverlayProgressComponent,
    JobRunnerModalComponent,
    ModalSelectItemsComponent,
    AppCustomPrintComponent,
    TelemetryComponent,
  ],
  exports: [
    LayoutComponent,
    DashboardComponent,
    GroupOperationsBrowseComponent,
    UnavailableComponent,
    AppCustomModalComponent,
    LogsDownloadComponent,
    JobRunnerModalComponent,
    AppCustomPrintComponent,
  ],
  entryComponents: [
    AgGridLookupRendererComponent,
    AgGridCheckboxRendererComponent,
    AgGridOverlayProgressComponent,
    ModalDateFromToComponent,
    ModalDateComponent,
    ModalTextStringComponent,
    ModalTwoTextStringComponent,
    ModalSelectItemsComponent,
  ]
})
export class PagesModule {
}
