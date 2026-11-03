// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { FireMode } from "../emitter/FireMode";
import { INode } from "./INode";
import { BaseNode } from "./BaseNode";
import { IArrayNode, IReadonlyArrayNode, IReadonlyArrayNodeSymbol, IArrayNodeSymbol } from "./IArrayNode";
import { DualMultiArgEmitter, DualMultiArgEvent } from "../emitter/DualMultiArgEmitter";
import { IArrayNodeMutation } from "./IArrayNodeMutation";
import { isIChildNode } from "./IChildNode";

export class ArrayNode<T> extends BaseNode implements IArrayNode<T> {
  constructor(
    data: T[] | null = null,
    parent: WeakRef<INode> | null = null,
    arrayValueChangedFireMode: FireMode = FireMode.Debounce,
    arrayStructureChangedFireMode: FireMode = FireMode.Debounce,
    dataChangedFireMode: FireMode = FireMode.Debounce
  ) {
    super(dataChangedFireMode);

    this._parent = parent;
    this._arrayValueChangedFireMode = arrayValueChangedFireMode;
    this._arrayStructureChangedFireMode = arrayStructureChangedFireMode;

    if (data === null) {
      this._data = [];
    } else {
      this._data = new Array<T>(data.length);
      for (let i: number = 0; i < data.length; i++) {
        this._data[i] = data[i];
      }
    }
  }

  public readonly [IReadonlyArrayNodeSymbol] = true;
  public readonly [IArrayNodeSymbol] = true;

  public override toString(): string {
    if (this._isDisposed) {
      return "ArrayNode(disposed)";
    } else {
      return `ArrayNode()`;
    }
  }

  protected _data: T[];

  public get length(): number {
    return this._data.length;
  }

  protected _parent: WeakRef<INode> | null;
  public get parent(): WeakRef<INode> | null {
    return this._parent;
  }

  public getValue(index: number): T {
    return this._data[index];
  }

  public setValue(index: number, value: T): void {
    if (this._data[index] !== value) {
      // TODO consider IEquals<T>
      const old: T = this._data[index];
      if (isIChildNode(old)) {
        old.parent = null;
      }
      this._data[index] = value;
      if (isIChildNode(value)) {
        value.parent = new WeakRef(this);
      }
      this._arrayValueChangedEmitter?.fire(this, index);
      this.propagateDataChanged(this, [this]);
    }
  }

  protected _arrayStructureChangedFireMode: FireMode;
  protected _arrayStructureChangedEmitter: DualMultiArgEmitter<[IReadonlyArrayNode<T>, IArrayNodeMutation[]]> | null = null;
  // source: IReadonlyArrayNode<T>
  // mutations: IArrayNodeMutation[]
  public get arrayStructureChanged(): DualMultiArgEvent<[IReadonlyArrayNode<T>, IArrayNodeMutation[]]> {
    if (this._arrayStructureChangedEmitter === null) {
      this._arrayStructureChangedEmitter = new DualMultiArgEmitter<[IReadonlyArrayNode<T>, IArrayNodeMutation[]]>(this._arrayStructureChangedFireMode);
    }
    return this._arrayStructureChangedEmitter.event;
  }

  protected _arrayValueChangedFireMode: FireMode;
  protected _arrayValueChangedEmitter: DualMultiArgEmitter<[IReadonlyArrayNode<T>, number]> | null = null;
  // source: IReadonlyArrayNode<T>
  // index: number
  public get arrayValueChanged(): DualMultiArgEvent<[IReadonlyArrayNode<T>, number]> {
    if (this._arrayValueChangedEmitter === null) {
      this._arrayValueChangedEmitter = new DualMultiArgEmitter<[IReadonlyArrayNode<T>, number]>(this._arrayValueChangedFireMode);
    }
    return this._arrayValueChangedEmitter.event;
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

  public override [Symbol.dispose](): void {
    if (!this._isDisposed) {
      this._arrayStructureChangedEmitter?.[Symbol.dispose]();
      this._arrayValueChangedEmitter?.[Symbol.dispose]();
    }
    super[Symbol.dispose]();
  }
}
