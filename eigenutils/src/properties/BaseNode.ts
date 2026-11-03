// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { INode, INodeSymbol } from "./INode";
import { FireMode } from "../emitter/FireMode";
import { DualMultiArgEvent, DualMultiArgEmitter } from "../emitter/DualMultiArgEmitter";

export class BaseNode implements INode {
  constructor(dataChangedFireMode: FireMode = FireMode.Debounce) {
    this._dataChangedFireMode = dataChangedFireMode;
  }

  public readonly [INodeSymbol] = true;

  public toString(): string {
    if (this._isDisposed) {
      return "BaseNode(disposed)";
    } else {
      return "BaseNode()";
    }
  }

  protected _dataChangedFireMode = FireMode.Debounce;
  public get dataChangedFireMode(): FireMode {
    return this._dataChangedFireMode;
  }

  protected _dataChangedEmitter: DualMultiArgEmitter<[INode | null, INode[] | null]> | null = null;
  // source: INode | null
  // path: INode[] | null
  public get dataChanged(): DualMultiArgEvent<[INode | null, INode[] | null]> {
    if (this._isDisposed) {
      throw new Error(`get dataChanged after dispose`);
    }
    if (this._dataChangedEmitter === null) {
      this._dataChangedEmitter = new DualMultiArgEmitter<[INode | null, INode[] | null]>(this._dataChangedFireMode);
    }
    return this._dataChangedEmitter.event;
  }

  public propagateDataChanged(_source: INode | null, _path: INode[] | null): void {
    // Intended to be overridden
  }

  protected _isDisposed: boolean = false;
  public [Symbol.dispose](): void {
    if (!this._isDisposed) {
      this._dataChangedEmitter?.[Symbol.dispose]();
      this._isDisposed = true;
    }
  }
}
