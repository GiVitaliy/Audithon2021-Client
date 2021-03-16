import {ComponentFactoryResolver, Directive, Input, ViewContainerRef} from '@angular/core';
import {IModalBody} from '../../logic/services/app-navigation.service.models';


@Directive({
  selector: '[appCustomModalHost]',
})
export class AppCustomModalHostDirective {
  private _componentType: any;
  @Input() public get appCustomModalHost() {
    return this._componentType;
  }

  private _onBodyCreate: (body: IModalBody<any, any>) => {};
  @Input() public get appCustomModalHostOnBodyCreate(): (body: IModalBody<any, any>) => {} {
    return this._onBodyCreate;
  }

  public bodyComponent: IModalBody<any, any>;

  public set appCustomModalHost(val: any) {
    if (this._componentType !== val) {
      this._componentType = val;

      // this.viewContainerRef.clear();

      if (this._componentType) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this._componentType);
        this.bodyComponent = this.viewContainerRef.createComponent(componentFactory).instance as IModalBody<any, any>;

        this._onBodyCreateOccuried = false;
        this.execOnBodyCreated();
      }
    }
  }

  private _onBodyCreateOccuried = false;

  public set appCustomModalHostOnBodyCreate(func: (body: IModalBody<any, any>) => {}) {
    if (this._onBodyCreate !== func) {
      this._onBodyCreate = func;

      this._onBodyCreateOccuried = false;
      this.execOnBodyCreated();
    }
  }

  private execOnBodyCreated() {
    if (this._onBodyCreateOccuried) { return; }

    if (this.bodyComponent != null && this._onBodyCreate != null) {
      this._onBodyCreateOccuried = true;
      this._onBodyCreate(this.bodyComponent);
    }
  }

  constructor(private viewContainerRef: ViewContainerRef,
              private componentFactoryResolver: ComponentFactoryResolver) { }
}
