// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { FireMode } from "../emitter/FireMode";
import { BaseNode } from "../properties/BaseNode";
import { IDependency, IDependencySymbol, DependencyState } from "./IDependency";
import { DualMultiArgEmitter, DualMultiArgEvent } from "../emitter/DualMultiArgEmitter";

export class BaseNodeDependency extends BaseNode implements IDependency {
  constructor(dataChangedFireMode: FireMode = FireMode.Debounce) {
    super(dataChangedFireMode);
  }
  
  readonly [IDependencySymbol] = true;

  protected setDependencyState(state: DependencyState) {
    if (this._dependencyState !== state) {
      this._dependencyState = state;
      this._dependencyStateChangedEmitter?.fire(this, state);
    }
  }

  protected _dependencyState: DependencyState = DependencyState.Uninitialized;
  public get dependencyState(): DependencyState {
    return this._dependencyState;
  }

  protected _dependencyStateChangedEmitter: DualMultiArgEmitter<[IDependency, DependencyState]> | null = null;
  public get dependencyStateChanged(): DualMultiArgEvent<[IDependency, DependencyState]> {
    if (this._dependencyStateChangedEmitter === null) {
      this._dependencyStateChangedEmitter = new DualMultiArgEmitter<[IDependency, DependencyState]>();
    }
    return this._dependencyStateChangedEmitter.event;
  }

  public override [Symbol.dispose](): void {
    if (!this._isDisposed) {
      this._dependencyStateChangedEmitter?.[Symbol.dispose]();
    }
    super[Symbol.dispose]();
  }
}
