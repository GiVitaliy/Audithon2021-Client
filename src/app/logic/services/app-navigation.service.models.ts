import {Observable} from 'rxjs/index';

export class ModalResult<T> {
  constructor (public succeed: boolean, public data: T) {
  }
}

export interface IModalBody<TInit, TResult> {
  initModalBody(data: TInit);
  onModalAccept$(): Observable<ModalResult<TResult>>;
}

export enum ModalSize {
  default = 0,
  sm = 1,
  medium = 2,
  lg = 3,
  xl = 4,
}

export class ModalParams<TParams> {
  constructor(public readonly size: ModalSize,
              public readonly title: string,
              public readonly acceptText: string,
              public readonly initBodyParams: TParams) {}
}

export interface IPrintData<TInit> {
  initPrintData(data: TInit);
}
