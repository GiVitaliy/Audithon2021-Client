import { Component, OnInit } from '@angular/core';
import { AppNavigationService } from '../../../logic/services/app-navigation.service';
import { MetadataService } from '../../../logic/services/metadata.service';
import { UserSettingService } from '../../../logic/services/user-setting.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  availableReports = [];
  printing = false;

  constructor(public appNavigationService: AppNavigationService,
              private metadataService: MetadataService,
              public userSettingService: UserSettingService) {
  }

  ngOnInit(): void {

  }
}
