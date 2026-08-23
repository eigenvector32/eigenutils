// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IDataPropertyParent } from "./IDataProperty";
import { BaseDataPropertyWithValidation } from "./IDataPropertyWithValidation";

export class NumberDataProperty extends BaseDataPropertyWithValidation<number> {
  constructor(
    value: number,
    minValue: number | null = null,
    maxValue: number | null = null,
    nodeName: string | null = null,
    index: number | null = null,
    parent: IDataPropertyParent | null = null
  ) {
    super(value, nodeName, index, parent);

    this._minValue = minValue;
    this._maxValue = maxValue;
  }

  public override toString(): string {
    if (this._isDisposed) {
      return "NumberDataProperty(disposed)";
    }
    if (this._index === null) {
      return `NumberDataProperty(${this._nodeName}, ${this._value})`;
    } else {
      return `NumberDataProperty(${this._nodeName}[${this._index}], ${this._value})`;
    }
  }

  protected _minValue: number | null;
  public get minValue(): number | null {
    return this._minValue;
  }

  protected _maxValue: number | null;
  public get maxValue(): number | null {
    return this._maxValue;
  }

  public throwOnInvalidValue: boolean = false;
  public clampValue: boolean = false;

  protected override validateImpl(): void {
    if (this.clampValue) {
      if (this._minValue !== null && this._value < this._minValue) {
        this._value = this._minValue;
      }
      if (this._maxValue !== null && this._value > this._maxValue) {
        this._value = this._maxValue;
      }
    } else {
      if (this._minValue !== null && this._value < this._minValue) {
        if (this.throwOnInvalidValue) {
          throw new Error(`value ${this._value} is less than minValue ${this._minValue}`);
        }
        this._isValid = false;
        return;
      }
      if (this._maxValue !== null && this._value > this._maxValue) {
        if (this.throwOnInvalidValue) {
          throw new Error(`value ${this._value} is more than maxValue ${this._maxValue}`);
        }
        this._isValid = false;
        return;
      }
    }
    this._isValid = true;
  }
}
