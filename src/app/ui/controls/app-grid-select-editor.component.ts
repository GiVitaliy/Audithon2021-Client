import {AfterViewInit, Component, ViewChild, ViewContainerRef} from '@angular/core';
import {ICellEditorAngularComp} from 'ag-grid-angular';
import {Observable} from 'rxjs/internal/Observable';
import {LookupSourceService} from '../../logic/services/lookup-source.service';

@Component({
  selector: 'app-grid-select-editor',
  templateUrl: './app-grid-select-editor.component.html',
  styles: [`select {
  max-width: 100%;
  width: 100%;
  height: 100% !important;
}`]
})
export class AppGridSelectEditorComponent implements ICellEditorAngularComp, AfterViewInit {
  private params: any;
  public value: number;
  public options$: Observable<any[]>;

  @ViewChild('input', {read: ViewContainerRef}) public input: ViewContainerRef;

  agInit(params: any): void {
    this.params = params;
    if (this.params.options$Provider) {
      this.options$ = this.params.options$Provider(this.params.data);
    } else {
      this.options$ = params.options$;
    }
    if (this.params.valueProvider) {
      this.value = this.params.valueProvider(this.params.data);
    } else {
      this.value = this.params.value;
    }
  }

  getValue(): any {
    return this.value;
  }

  ngAfterViewInit() {
    window.setTimeout(() => {
      this.input.element.nativeElement.focus();
    }, 100);
  }

  keyDown($event) {
    if ($event['code'] && ($event['code'] === 'Delete' || $event['code'] === 'Backspace')) {
      this.value = null;
      return;
    }
    if ($event['keyCode'] && ($event['keyCode'] === 8 || $event['keyCode'] === 46) ) {
      this.value = null;
      return;
    }
  }

}
