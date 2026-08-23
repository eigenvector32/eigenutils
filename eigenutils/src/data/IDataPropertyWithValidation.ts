// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IDataProperty, BaseDataProperty, IDataPropertyParent } from "./IDataProperty";
import { DualMultiArgEmitter, DualMultiArgEvent } from "../emitter/DualMultiArgEmitter";

export const IDataPropertyWithValidationSymbol: unique symbol = Symbol.for("eigenutils.IDataPropertyWithValidationSymbol");

export function isIDataProperty(input: any): input is IDataPropertyWithValidation<unknown> {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IDataPropertyWithValidationSymbol] === true;
}

export interface IDataPropertyWithValidation<T> extends IDataProperty<T> {
  [IDataPropertyWithValidationSymbol]: true;
  readonly isValid: boolean;
  readonly isValidChanged: DualMultiArgEvent<[IDataProperty<T>, boolean]>;
}

export class BaseDataPropertyWithValidation<T> extends BaseDataProperty<T> implements IDataPropertyWithValidation<T> {
  constructor(value: T, nodeName: string | null = null, index: number | null = null, parent: IDataPropertyParent | null = null) {
    super(value, nodeName, index, parent);

    this.validate(false);
  }

  public override toString(): string {
    if (this._isDisposed) {
      return "BaseDataPropertyWithValidation(disposed)";
    }
    if (this._index === null) {
      return `BaseDataPropertyWithValidation(${this._nodeName}, ${this._value}, ${this._isValid})`;
    } else {
      return `BaseDataPropertyWithValidation(${this._nodeName}[${this._index}], ${this._value}, ${this._isValid})`;
    }
  }

  public readonly [IDataPropertyWithValidationSymbol] = true;

  protected override valueChanged(): void {
    this.validate();
  }

  protected validate(notify: boolean = true): void {
    const oldVal: boolean = this._isValid;
    this.validateImpl();
    if (oldVal !== this._isValid) {
      this.validChanged(notify);
      if (notify) {
        this._isValidChangedEmitter?.fire(this, this._isValid);
      }
    }
  }

  // Intended to be overridden
  protected validateImpl(): void {
    // NOP
  }

  // Intended to be overridden
  protected validChanged(_notify: boolean): void {
    // NOP
  }

  protected override fireModeChanged(): void {
    if (this._isValidChangedEmitter !== null) {
      this._isValidChangedEmitter.fireMode = this._fireMode;
    }
  }

  protected _isValid: boolean = true;
  public get isValid(): boolean {
    return this._isValid;
  }

  protected _isValidChangedEmitter: DualMultiArgEmitter<[IDataProperty<T>, boolean]> | null = null;
  public get isValidChanged(): DualMultiArgEvent<[IDataProperty<T>, boolean]> {
    if (this._isValidChangedEmitter === null) {
      this._isValidChangedEmitter = new DualMultiArgEmitter<[IDataProperty<T>, boolean]>(this._fireMode);
    }
    return this._isValidChangedEmitter.event;
  }

  public override [Symbol.dispose](): void {
    if (!this._isDisposed) {
      this._isValidChangedEmitter?.[Symbol.dispose]();
    }
    super[Symbol.dispose]();
  }
}
