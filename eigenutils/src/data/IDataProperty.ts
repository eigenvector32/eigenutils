// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { isDisposable } from "../IDisposable";
import { IDataNode, BaseDataNode } from "./IDataNode";

export const IDataPropertyParentSymbol: unique symbol = Symbol.for("eigenutils.IDataPropertyParentSymbol");

export interface IDataPropertyParent {
  readonly [IDataPropertyParentSymbol]: true;
  onChildPropertyChanged(source: IDataProperty<unknown> | null, propertyName: string | null, index: number | null, path: IDataNode[]): void;
}

export function isIDataPropertyParent(input: any): input is IDataPropertyParent {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IDataPropertyParentSymbol] === true;
}

export const IReadonlyDataPropertySymbol: unique symbol = Symbol.for("eigenutils.IReadonlyDataPropertySymbol");

export function isIReadonlyDataProperty(input: any): input is IReadonlyDataProperty<unknown> {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IReadonlyDataPropertySymbol] === true;
}

export interface IReadonlyDataProperty<T> extends IDataNode {
  readonly [IReadonlyDataPropertySymbol]: true;
  readonly parent: IDataPropertyParent | null;
  readonly value: T;
}

export const IDataPropertySymbol: unique symbol = Symbol.for("eigenutils.IDataPropertySymbol");

export function isIDataProperty(input: any): input is IDataProperty<unknown> {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IDataPropertySymbol] === true;
}

export interface IDataProperty<T> extends IReadonlyDataProperty<T> {
  readonly [IDataPropertySymbol]: true;
  readonly parent: IDataPropertyParent | null;
  value: T;
}

export class BaseDataProperty<T> extends BaseDataNode implements IDataProperty<T> {
  constructor(value: T, nodeName: string | null = null, index: number | null = null, parent: IDataPropertyParent | null = null) {
    super(nodeName, index);

    this._value = value;
    if (parent) {
      this._parent = new WeakRef<IDataPropertyParent>(parent);
    } else {
      // The else statement here is due to the ts compiler not figuring out that _parent was definitively assigned otherwise
      this._parent = null;
    }
  }

  public override toString(): string {
    if (this._isDisposed) {
      return "BaseDataProperty(disposed)";
    }
    if (this._index === null) {
      return `BaseDataProperty(${this._nodeName}, ${this._value})`;
    } else {
      return `BaseDataProperty(${this._nodeName}[${this._index}], ${this._value})`;
    }
  }

  public readonly [IReadonlyDataPropertySymbol] = true;
  public readonly [IDataPropertySymbol] = true;

  protected _parent: WeakRef<IDataPropertyParent> | null;
  public get parent(): IDataPropertyParent | null {
    const parentRef: IDataPropertyParent | undefined | null = this._parent?.deref();
    if (parentRef) {
      return parentRef;
    }
    return null;
  }

  protected _value: T;
  public get value(): T {
    return this._value;
  }
  public set value(newVal: T) {
    if (this._value !== newVal) {
      this._value = newVal;
      this.valueChanged();
      this._dataChangedEmitter?.fire(this, this._nodeName, this._index, [this]);
      const parentRef: IDataPropertyParent | undefined | null = this._parent?.deref();
      if (parentRef) {
        parentRef.onChildPropertyChanged(this, this._nodeName, this._index, [this]);
      }
    }
  }

  // Intended to be overridden
  protected valueChanged(): void {
    // NOP
  }

  public override [Symbol.dispose](): void {
    if (!this._isDisposed) {
      if (isDisposable(this._value)) {
        this._value[Symbol.dispose]();
      }
      this._parent = null;
    }
    super[Symbol.dispose]();
  }
}

export const IDataNodeWithPropertiesSymbol: unique symbol = Symbol.for("eigenutils.IDataNodeWithPropertiesSymbol");

export interface IDataNodeWithProperties extends IDataPropertyParent, IDataNode {
  readonly [IDataNodeWithPropertiesSymbol]: true;
  readonly properties: Map<string, IDataProperty<unknown>>;
}

export function isIDataNodeWithProperties(input: any): input is IDataNodeWithProperties {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IDataNodeWithPropertiesSymbol] === true;
}

export class BaseDataNodeWithProperties extends BaseDataNode implements IDataNodeWithProperties {
  public override toString(): string {
    if (this._isDisposed) {
      return "BaseDataNodeWithProperties(disposed)";
    }
    if (this._index === null) {
      return `BaseDataNodeWithProperties(${this._nodeName},${this._properties})`;
    } else {
      return `BaseDataNodeWithProperties(${this._nodeName}[${this._index}],${this._properties})`;
    }
  }

  public readonly [IDataNodeWithPropertiesSymbol] = true;
  public readonly [IDataPropertyParentSymbol] = true;

  protected _properties: Map<string, IDataProperty<unknown>> = new Map<string, IDataProperty<unknown>>();
  public get properties(): Map<string, IDataProperty<unknown>> {
    return this._properties;
  }

  public onChildPropertyChanged(source: IDataProperty<unknown> | null, propertyName: string | null, index: number | null, path: IDataNode[]): void {
    path.push(this);

    this._dataChangedEmitter?.fire(source, propertyName, index, path);
  }

  public override [Symbol.dispose](): void {
    if (!this._isDisposed) {
      this._properties.forEach((prop: IDataProperty<unknown>, _: string) => {
        prop[Symbol.dispose]();
      });
      this._properties = new Map<string, IDataProperty<unknown>>();
    }
    super[Symbol.dispose]();
  }
}
