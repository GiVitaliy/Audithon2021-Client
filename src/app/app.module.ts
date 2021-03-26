import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { UiModule } from './ui/ui.module';
import { AppRoutingModule } from './app.routing';
import { PagesModule } from './pages/pages.module';
import { AppNavigationService } from './logic/services/app-navigation.service';
import { AlertService } from './ui/infrastructure/alert.service';
import { GlobalWaitingOverlayService } from './ui/infrastructure/global-waiting-overlay.service';
import { DataCachingService } from './logic/services/data-caching.service';
import { MetadataService } from './logic/services/metadata.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LookupSourceService } from './logic/services/lookup-source.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AlertsHttpInterceptor } from './logic/services/alerts-http-interceptor';
import { HashLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { GroupOperationsService } from './logic/services/group-operations.service';
import { UnavailableHttpInterceptor } from './logic/services/unavailable-http-interceptor';
import { ToastrModule } from 'ngx-toastr';
import { ClarityModule } from '@clr/angular';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { LoggerFactory } from './logger/logger.factory';
import { ProcessingHelper } from './helpers/processing-helper';
import { UserSettingService } from './logic/services/user-setting.service';
import { IndicatorUiService } from './logic/services/indicator-ui.service';

registerLocaleData(localeRu);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ClarityModule,
    UiModule,
    PagesModule,
    AppRoutingModule,
    HttpClientModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-bottom-left',
      preventDuplicates: true,
    }),
    BrowserAnimationsModule,
    LoggerModule.forRoot({
      level: NgxLoggerLevel.ERROR, // меняется в logger.factory
      disableConsoleLogging: false
    }),
  ],
  providers: [
    AppNavigationService,
    AlertService,
    ProcessingHelper,
    GlobalWaitingOverlayService,
    DataCachingService,
    MetadataService,
    LookupSourceService,
    UserSettingService,
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {provide: HTTP_INTERCEPTORS, useClass: AlertsHttpInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: UnavailableHttpInterceptor, multi: true},
    LoggerFactory,
    {provide: LOCALE_ID, useValue: 'ru'},
    GroupOperationsService,
    GroupOperationsService,
    IndicatorUiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
