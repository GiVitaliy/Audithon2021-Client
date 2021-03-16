import { Pipe, PipeTransform } from '@angular/core';
import { LookupSourceService } from '../services/lookup-source.service';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/internal/operators';

@Pipe({name: 'rawlookup'})
export class RawLookupSourcePipe implements PipeTransform {
  constructor(private lookupSourceService: LookupSourceService) {

  }

  transform(value: any, lookupName: string, captionFieldName: string) {
    if (!value) {
      return new BehaviorSubject<any>('-');
    }

    captionFieldName = !captionFieldName ? 'caption' : captionFieldName;
    return this.lookupSourceService.getLookupObj(lookupName)
      .pipe(map(lookup => lookup['Obj' + value]
        ? (lookup['Obj' + value][captionFieldName])
        : 'N/A'));
  }
}
