import { Component, OnInit } from '@angular/core';
import { AppNavigationService } from '../../../logic/services/app-navigation.service';
import { environment } from '../../../../environments/environment';
import { AlertService } from '../../../ui/infrastructure/alert.service';
import { LookupSourceService } from '../../../logic/services/lookup-source.service';
import { MetadataService } from '../../../logic/services/metadata.service';
import { UserSettingService } from '../../../logic/services/user-setting.service';
import { JobRunnerUiService } from '../../../ui/infrastructure/job-runner-ui.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  testEnvText = '';
  versionText = '';

  constructor(public alertService: AlertService,
              public metadataService: MetadataService,
              public appNavigationService: AppNavigationService,
              public lookupSourceService: LookupSourceService,
              public userSettingService: UserSettingService,
              private jobRunnerUiService: JobRunnerUiService) {
    if (!environment.production) {
      this.testEnvText = 'ТЕСТОВАЯ ';
    }
    this.versionText = environment.version;
  }

  ngOnInit() {
  }

  runDownloadEgissoStatistic() {
    const params = {type: 'downloadEgissoStatistic'};
    this.jobRunnerUiService.runOperation(1 /*Актуализация статистики из ЕГИССО*/, params).subscribe(result => {
      this.alertService.success('Актуализация статистики из ЕГИССО успешно проведена');
    });
  }
}
