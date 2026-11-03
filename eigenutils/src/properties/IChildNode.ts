import { INode } from "./INode";

export const IReadonlyChildNodeSymbol: unique symbol = Symbol.for("eigenutils.IReadonlyChildNodeSymbol");

export function isIReadonlyChildNode(input: any): input is IReadonlyChildNode {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IReadonlyChildNodeSymbol] === true;
}

export interface IReadonlyChildNode extends INode {
  readonly [IReadonlyChildNodeSymbol]: true;
  readonly parent: WeakRef<INode> | null;
}

export const IChildNodeSymbol: unique symbol = Symbol.for("eigenutils.IChildNodeSymbol");

export function isIChildNode(input: any): input is IChildNode {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IChildNodeSymbol] === true;
}

export interface IChildNode extends IReadonlyChildNode {
  readonly [IChildNodeSymbol]: true;
  parent: WeakRef<INode> | null;
}
