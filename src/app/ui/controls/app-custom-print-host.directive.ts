import {ComponentFactoryResolver, Directive, Input, ViewContainerRef} from '@angular/core';
import {IModalBody, IPrintData} from '../../logic/services/app-navigation.service.models';

@Directive({
  selector: '[appCustomPrintHost]',
})
export class AppCustomPrintHostDirective {
  public bodyComponent: IPrintData<any>;
  private _onBodyCreateOccuried = false;
  private _componentType: any;
  @Input() public get appCustomPrintHost() {
    return this._componentType;
  }

  public set appCustomPrintHost(val: any) {
    if (this._componentType !== val) {
      this._componentType = val;
      if (this._componentType) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this._componentType);
        this.bodyComponent = this.viewContainerRef.createComponent(componentFactory).instance as IPrintData<any>;
        this._onBodyCreateOccuried = false;
        this.execOnBodyCreated();
      } else {
        this.viewContainerRef.clear();
      }
    }
  }

  private _onBodyCreate: (body: IPrintData<any>) => {};
  @Input() public get appCustomPrintHostOnBodyCreate(): (body: IPrintData<any>) => {} {
    return this._onBodyCreate;
  }

  public set appCustomPrintHostOnBodyCreate(func: (body: IPrintData<any>) => {}) {
    if (this._onBodyCreate !== func) {
      this._onBodyCreate = func;

      this._onBodyCreateOccuried = false;
      this.execOnBodyCreated();
    }
  }

  private execOnBodyCreated() {
    if (this._onBodyCreateOccuried) {
      return;
    }

    if (this.bodyComponent != null && this._onBodyCreate != null) {
      this._onBodyCreateOccuried = true;
      this._onBodyCreate(this.bodyComponent);
    }
  }

  constructor(private viewContainerRef: ViewContainerRef,
              private componentFactoryResolver: ComponentFactoryResolver) { }
}
