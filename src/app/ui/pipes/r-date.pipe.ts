import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'rdate'
})
export class RDatePipe extends DatePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (args) {
      return super.transform(value, 'yyyy г/р.');
    } else {
      return super.transform(value, 'dd.MM.yyyy');
    }
  }
}
