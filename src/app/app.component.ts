import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { AlertService } from './ui/infrastructure/alert.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private alertService: AlertService,
              vcr: ViewContainerRef) {
  }

  ngOnInit(): void {
    if (environment.production) {
      setTimeout(() => {
        this.alertService.info('Добро пожаловать в систему анализа статистических данных по социальной поддержке малоимущих ' +
          'граждан в субъектах Российской Федерации!');
      }, 10);
    }
  }
}
