import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { LicenseManager } from 'ag-grid-enterprise';

LicenseManager.setLicenseKey('Infotech_Ltd__PPO_ASOI_1Devs4_December_2019__MTU3NTQxNzYwMDAwMA==9e753851e3d739bb9afe88c6d9d0ba67');

if (environment.production) {
  enableProdMode();
}


if (!environment.production) {
  console.log('*** BOOTSTRAP');
}
platformBrowserDynamic().bootstrapModule(AppModule);

