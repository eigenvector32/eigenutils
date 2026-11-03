// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { FireMode } from "../emitter/FireMode";
import { INode } from "./INode";
import { IValidatedNode, IValidatedNodeSymbol } from "./IValidatedNode";
import { Property } from "./Property";
import { DualMultiArgEmitter, DualMultiArgEvent } from "../emitter/DualMultiArgEmitter";

export class ValidatedProperty<T> extends Property<T> implements IValidatedNode {
  constructor(
    value: T,
    parent: WeakRef<INode> | null = null,
    dataChangedFireMode: FireMode = FireMode.Debounce,
    isValidChangedFireMode: FireMode = FireMode.Debounce
  ) {
    super(value, parent, dataChangedFireMode);

    this._isValidChangedFireMode = isValidChangedFireMode;

    this.validate(false);
  }

  public readonly [IValidatedNodeSymbol] = true;

  public override toString(): string {
    if (this._isDisposed) {
      return "ValidatedProperty(disposed)";
    } else {
      return `ValidatedProperty(${this._value})`;
    }
  }

  protected override postValueChange(): void {
    this.validate(true);
  }

  protected _isValid: boolean = true;
  public get isValid(): boolean {
    if (this._isDisposed) {
      throw new Error(`get isValid after dispose`);
    }
    return this._isValid;
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

  protected _isValidChangedFireMode;
  public get isValidChangedFireMode(): FireMode {
    if (this._isDisposed) {
      throw new Error(`get isValidChangedFireMode after dispose`);
    }
    return this._isValidChangedFireMode;
  }

  protected _isValidChangedEmitter: DualMultiArgEmitter<[IValidatedNode, boolean]> | null = null;
  // source: IValidatedNode
  // valid: boolean
  public get isValidChanged(): DualMultiArgEvent<[IValidatedNode, boolean]> {
    if (this._isDisposed) {
      throw new Error(`get isValidChanged after dispose`);
    }
    if (this._isValidChangedEmitter === null) {
      this._isValidChangedEmitter = new DualMultiArgEmitter<[IValidatedNode, boolean]>(this._dataChangedFireMode);
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
