import { Pipe, PipeTransform } from '@angular/core';
import { LookupSourceService } from '../services/lookup-source.service';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/internal/operators';
import {StringHelper} from '../../helpers/string-helper';

@Pipe({name: 'htmlbreaks'})
export class SafeHtmlBreaksPipe implements PipeTransform {
  constructor() {

  }

  transform(value: String) {
    return StringHelper.textToHtml(value);
  }


}
