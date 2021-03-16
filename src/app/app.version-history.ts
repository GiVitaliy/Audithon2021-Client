import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppVersionHistory {
  public versions = [
    {
      version: '0.0.1',
      releaseDate: '16.03.2021',
      changes: [
        'Подготовлена заготовка (boilerplate) приложения для Хакатона Audithon 2021',
      ]
    },
  ];
}
