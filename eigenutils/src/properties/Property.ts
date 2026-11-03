// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { INode } from "./INode";
import { FireMode } from "../emitter/FireMode";
import { BaseNode } from "./BaseNode";
import { IProperty, IPropertySymbol, IReadonlyPropertySymbol } from "./IProperty";
import { IChildNode, IChildNodeSymbol, IReadonlyChildNodeSymbol } from "./IChildNode";

export class Property<T> extends BaseNode implements IProperty<T>, IChildNode {
  constructor(value: T, parent: WeakRef<INode> | null = null, dataChangedFireMode: FireMode = FireMode.Debounce) {
    super(dataChangedFireMode);

    this._value = value;
    this._parent = parent;
  }

  public readonly [IReadonlyChildNodeSymbol] = true;
  public readonly [IChildNodeSymbol] = true;
  public readonly [IReadonlyPropertySymbol] = true;
  public readonly [IPropertySymbol] = true;

  public override toString(): string {
    if (this._isDisposed) {
      return "Property(disposed)";
    } else {
      return `Property(${this._value})`;
    }
  }

  protected _parent: WeakRef<INode> | null;
  public get parent(): WeakRef<INode> | null {
    return this._parent;
  }
  public set parent(input: WeakRef<INode> | null) {
    this._parent = input;
  }

  protected _value: T;
  public get value(): T {
    if (this._isDisposed) {
      throw new Error(`get value after dispose`);
    }
    return this._value;
  }
  public set value(input: T) {
    if (this._isDisposed) {
      throw new Error(`set value after dispose`);
    }
    if (this._value !== input) {
      if (this.preValueChange(input)) {
        return;
      }
      this._value = input;
      this.postValueChange();
      this._dataChangedEmitter?.fire(this, [this]);
      const parentRef: INode | undefined | null = this._parent?.deref();
      if (parentRef) {
        parentRef.propagateDataChanged(this, [this]);
      }
    }
  }

  // It can be convenient sometimes to have a method signature to work with rather than a property signature
  public getValue(): T {
    return this._value;
  }
  // It can be convenient sometimes to have a method signature to work with rather than a property signature
  public setValue(value: T): void {
    this.value = value;
  }

  public override propagateDataChanged(source: INode | null, path: INode[] | null): void {
    if (this._isDisposed) {
      throw new Error(`propagateDataChanged called after dispose`);
    }
    const parentRef: INode | undefined | null = this._parent?.deref();
    if (parentRef) {
      path?.push(this);
      parentRef.propagateDataChanged(source, path);
    }
  }

  protected preValueChange(_input: T): boolean {
    // Intended to be overridden
    return false;
  }

  protected postValueChange(): void {
    // Intended to be overridden
  }
}
