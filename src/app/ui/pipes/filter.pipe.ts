import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  pure: false
})
export class FilterPipe implements PipeTransform {

  transform(value: any, propName: string, filterValue: string, mode: string = 'equals'): any {
    const arr = value as any[];
    if (!arr || arr.length === 0 || !filterValue ||
      (mode !== 'equals' && mode !== 'starts' && mode !== 'contains')) {
      return value;
    }

    if (mode === 'equals') {
      return arr.filter(x => x[propName].toString() === filterValue);
    }
    if (mode === 'starts') {
      return arr.filter(x => x[propName].toString().startsWith(filterValue));
    }
    if (mode === 'contains') {
      return arr.filter(x => x[propName].toString().indexOf(filterValue) >= 0);
    }
  }

}
