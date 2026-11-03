// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IDisposable } from "../IDisposable";
import { DualMultiArgEvent } from "../emitter/DualMultiArgEmitter";

export const INodeSymbol: unique symbol = Symbol.for("eigenutils.INodeSymbol");

export function isINode(input: any): input is INode {
  if (input === null || input === undefined) {
    return false;
  }
  return input[INodeSymbol] === true;
}

export interface INode extends IDisposable {
  readonly [INodeSymbol]: true;
  // source: INode | null
  // path: INode[] | null
  readonly dataChanged: DualMultiArgEvent<[INode | null, INode[] | null]>;
  propagateDataChanged(source: INode | null, path: INode[] | null): void;
}
