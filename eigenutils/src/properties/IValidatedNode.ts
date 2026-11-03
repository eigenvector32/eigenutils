// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { INode } from "./INode";
import { DualMultiArgEvent } from "../emitter/DualMultiArgEmitter";

export const IValidatedNodeSymbol: unique symbol = Symbol.for("eigenutils.IValidatedNodeSymbol");

export function isIValidatedNode(input: any): input is IValidatedNode {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IValidatedNodeSymbol] === true;
}

export interface IValidatedNode extends INode {
  readonly [IValidatedNodeSymbol]: true;
  readonly isValid: boolean;
  // source: IValidatedNode
  // valid: boolean
  readonly isValidChanged: DualMultiArgEvent<[IValidatedNode, boolean]>;
}
