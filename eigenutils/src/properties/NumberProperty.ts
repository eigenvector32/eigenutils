// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { FireMode } from "../emitter/FireMode";
import { INode } from "./INode";
import { ValidatedProperty } from "./ValidatedProperty";

export class NumberProperty extends ValidatedProperty<number> {
  constructor(
    value: number,
    minValue: number | null = null,
    maxValue: number | null = null,
    parent: WeakRef<INode> | null = null,
    dataChangedFireMode: FireMode = FireMode.Debounce,
    isValidChangedFireMode: FireMode = FireMode.Debounce
  ) {
    super(value, parent, dataChangedFireMode, isValidChangedFireMode);

    this._minValue = minValue;
    this._maxValue = maxValue;
  }

  public override toString(): string {
    if (this._isDisposed) {
      return "NumberProperty(disposed)";
    } else {
      return `NumberProperty(${this._value})`;
    }
  }

  protected _minValue: number | null;
  public get minValue(): number | null {
    if (this._isDisposed) {
      throw new Error("get minValue after dispose");
    }
    return this._minValue;
  }
  public set minValue(input: number | null) {
    if (this._isDisposed) {
      throw new Error("set minValue after dispose");
    }
    this._minValue = input;
  }

  protected _maxValue: number | null;
  public get maxValue(): number | null {
    if (this._isDisposed) {
      throw new Error("get maxValue after dispose");
    }
    return this._maxValue;
  }
  public set maxValue(input: number | null) {
    if (this._isDisposed) {
      throw new Error("set maxValue after dispose");
    }
    this._maxValue = input;
  }

  protected _throwOnInvalidValue: boolean = false;
  public get throwOnInvalidValue(): boolean {
    if (this._isDisposed) {
      throw new Error("get throwOnInvalidValue after dispose");
    }
    return this._throwOnInvalidValue;
  }
  public set throwOnInvalidValue(input: boolean) {
    if (this._isDisposed) {
      throw new Error("set throwOnInvalidValue after dispose");
    }
    if (this._throwOnInvalidValue !== input) {
      this._throwOnInvalidValue = input;
      this.validate(true);
    }
  }

  protected _clampValue: boolean = false;
  public get clampValue(): boolean {
    if (this._isDisposed) {
      throw new Error("get clampValue after dispose");
    }
    return this._clampValue;
  }
  public set clampValue(input: boolean) {
    if (this._isDisposed) {
      throw new Error("set clampValue after dispose");
    }
    if (this._clampValue !== input) {
      this._clampValue = input;
      this.validate(true);
    }
  }

  protected override validateImpl(): void {
    if (this._clampValue) {
      if (this._minValue !== null && this._value < this._minValue) {
        this._value = this._minValue;
      }
      if (this._maxValue !== null && this._value > this._maxValue) {
        this._value = this._maxValue;
      }
    }
    if (this._minValue !== null && this._value < this._minValue) {
      if (this._throwOnInvalidValue) {
        throw new Error(`value ${this._value} is less than minValue ${this._minValue}`);
      }
      this._isValid = false;
      return;
    }
    if (this._maxValue !== null && this._value > this._maxValue) {
      if (this._throwOnInvalidValue) {
        throw new Error(`value ${this._value} is more than maxValue ${this._maxValue}`);
      }
      this._isValid = false;
      return;
    }
    this._isValid = true;
  }
}
