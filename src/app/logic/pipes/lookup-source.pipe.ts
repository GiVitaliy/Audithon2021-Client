import { Pipe, PipeTransform } from '@angular/core';
import { LookupSourceService } from '../services/lookup-source.service';

@Pipe({name: 'lookup'})
export class LookupSourcePipe implements PipeTransform {
  constructor(private lookupSourceService: LookupSourceService) {
  }

  transform(value: any, lookupName: string, useShort?: boolean, objId2?: string) {
    return this.lookupSourceService.getLookupCaption(value, lookupName, useShort, objId2);
  }
}
