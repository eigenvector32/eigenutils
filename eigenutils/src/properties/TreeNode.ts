// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { INode } from "./INode";
import { FireMode } from "../emitter/FireMode";
import { BaseNode } from "./BaseNode";
import { IChildNode, IChildNodeSymbol, IReadonlyChildNodeSymbol, isIChildNode } from "./IChildNode";

export class TreeNode extends BaseNode implements IChildNode {
  constructor(parent: WeakRef<INode> | null = null, children: INode[] | null, dataChangedFireMode: FireMode = FireMode.Debounce) {
    super(dataChangedFireMode);

    this._parent = parent;
    if (children !== null) {
      this._children = new Array<INode>(children.length);
      for (let i: number = 0; i < children.length; i++) {
        const child: INode = children[i];
        if (isIChildNode(child)) {
          child.parent = new WeakRef(this);
        }
        this._children[i] = children[i];
      }
    } else {
      this._children = [];
    }
  }

  readonly [IReadonlyChildNodeSymbol] = true;
  readonly [IChildNodeSymbol] = true;

  public override toString(): string {
    if (this._isDisposed) {
      return "TreeNode(disposed)";
    } else {
      return "TreeNode()";
    }
  }

  protected _parent: WeakRef<INode> | null;
  public get parent(): WeakRef<INode> | null {
    return this._parent;
  }

  protected _children: INode[];
  public get children(): ReadonlyArray<INode> {
    return this._children;
  }

  public addChild(child: INode): void {
    if (isIChildNode(child)) {
      child.parent = new WeakRef(this);
    }
    this._children.push(child);
  }

  public removeChild(index: number): void {
    const child: INode = this._children[index];
    if (isIChildNode(child)) {
      child.parent = null;
    }
    this._children.splice(index, 1);
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
}
