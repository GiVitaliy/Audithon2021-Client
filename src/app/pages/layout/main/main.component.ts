import { Component, OnInit } from '@angular/core';
import { GlobalWaitingOverlayService } from '../../../ui/infrastructure/global-waiting-overlay.service';
import { UserSettingService } from '../../../logic/services/user-setting.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  _waiting = false;

  constructor(private globalWaitingOverlayService: GlobalWaitingOverlayService,
              public userSettingService: UserSettingService) {
  }

  ngOnInit() {
    this.globalWaitingOverlayService.waiting.subscribe(waiting => {
      this._waiting = waiting;
    });
  }
}
