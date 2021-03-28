import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppVersionHistory {
  public versions = [
    {
      version: '1.0.0',
      releaseDate: '28.03.2021',
      changes: [
        'Подготовлена финальная версия приложения для защиты перед жюри',
      ]
    },
    {
      version: '0.0.3',
      releaseDate: '28.03.2021',
      changes: [
        'Подготовлена версия для Check Point 3',
      ]
    },
    {
      version: '0.0.2',
      releaseDate: '27.03.2021',
      changes: [
        'Подготовлена версия для Check Point 2',
      ]
    },
    {
      version: '0.0.1',
      releaseDate: '26.03.2021',
      changes: [
        'Подготовлена версия для Check Point 1',
      ]
    },
  ];
}
