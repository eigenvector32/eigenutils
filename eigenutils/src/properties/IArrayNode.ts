// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { INode } from "./INode";
import { DualMultiArgEvent } from "../emitter/DualMultiArgEmitter";
import { IArrayNodeMutation } from "./IArrayNodeMutation";

export const IReadonlyArrayNodeSymbol: unique symbol = Symbol.for("eigenutils.IReadonlyDataArraySymbol");

export function isIReadonlyArrayNode(input: any): input is IReadonlyArrayNode<unknown> {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IReadonlyArrayNodeSymbol] === true;
}

export interface IReadonlyArrayNode<T> {
  [IReadonlyArrayNodeSymbol]: true;

  // Note that IDataArray assumes a single parent (if any). In a graph scenario, the IDataArray would
  // be a child of a single graph node.
  readonly parent: WeakRef<INode> | null;

  readonly length: number;
  getValue(index: number): T;

  // Note that this only indicates a change in the structure of the array. It will not fire if
  // the value at a given index is changed.
  // source: IReadonlyArrayNode<T>
  // mutations: IArrayNodeMutation[]
  arrayStructureChanged: DualMultiArgEvent<[IReadonlyArrayNode<T>, IArrayNodeMutation[]]>;

  // source: IReadonlyArrayNode<T>
  // index: number
  arrayValueChanged: DualMultiArgEvent<[IReadonlyArrayNode<T>, number]>;
}

export const IArrayNodeSymbol: unique symbol = Symbol.for("eigenutils.IArrayNodeSymbol");

export function isArrayNodeArray(input: any): input is IArrayNode<unknown> {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IArrayNodeSymbol] === true;
}

export interface IArrayNode<T> extends IReadonlyArrayNode<T> {
  [IArrayNodeSymbol]: true;

  setValue(index: number, value: T): void;
}
