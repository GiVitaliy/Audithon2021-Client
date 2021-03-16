import { Component } from '@angular/core';
import { AppVersionHistory } from '../../../app.version-history';
import { AppNavigationService } from '../../../logic/services/app-navigation.service';

@Component({
  selector: 'app-version-history-modal',
  templateUrl: './version-history.component.html',
  styleUrls: ['./version-history.component.css']
})
export class VersionHistoryComponent {

  constructor(public appVersionHistory: AppVersionHistory,
              public appNavigationService: AppNavigationService) {
  }

}
