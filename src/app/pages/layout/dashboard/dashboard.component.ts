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

  moData: any = {4: {color: 12}, 3: {color: 3}, 5: {color: 13}, 6: {color: 23}, 18: {color: 63}, 71100: {color: 54}};

  constructor(public appNavigationService: AppNavigationService,
              private metadataService: MetadataService,
              public userSettingService: UserSettingService) {
  }

  ngOnInit(): void {

  }
}
