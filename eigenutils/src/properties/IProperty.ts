// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { INode } from "./INode";

export const IReadonlyPropertySymbol: unique symbol = Symbol.for("eigenutils.IReadonlyPropertySymbol");

export function isIReadonlyPropertySymbol(input: any): input is IReadonlyProperty<unknown> {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IReadonlyPropertySymbol] === true;
}

export interface IReadonlyProperty<T> extends INode {
  readonly [IReadonlyPropertySymbol]: true;
  readonly parent: WeakRef<INode> | null;
  readonly value: T;
  // It can be convenient sometimes to have a method signature to work with rather than a property signature
  getValue(): T;
}

export const IPropertySymbol: unique symbol = Symbol.for("eigenutils.IPropertySymbol");

export function isIProperty(input: any): input is IProperty<unknown> {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IPropertySymbol] === true;
}

export interface IProperty<T> extends IReadonlyProperty<T> {
  readonly [IPropertySymbol]: true;
  value: T;
  // It can be convenient sometimes to have a method signature to work with rather than a property signature
  setValue(value: T): void;
}
