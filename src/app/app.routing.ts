import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './pages/layout/dashboard/dashboard.component';
import { GroupOperationsBrowseComponent } from './pages/common/group-operations-browse.component';
import { UnavailableComponent } from './pages/common/unavailable.component';
import {LogsDownloadComponent} from './pages/system/logs-download.component';
import { JobScheduleBrowseComponent } from './pages/dictionary/common/job-schedule-browse.component';
import { TelemetryComponent } from './pages/admin/telemetry.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
      {path: 'dashboard', component: DashboardComponent},
      {path: 'telemetry', component: TelemetryComponent},
      {path: 'unavailable', component: UnavailableComponent},
      {path: 'group-operation-browse', component: GroupOperationsBrowseComponent},
      {path: 'dictionary/job-schedule-item', component: JobScheduleBrowseComponent},
      {path: 'system/logs', component: LogsDownloadComponent},
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class AppRoutingModule {
}
