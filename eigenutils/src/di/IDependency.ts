// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { DualMultiArgEvent } from "../emitter/DualMultiArgEmitter";
import { IDisposable } from "../IDisposable";

export const IDependencySymbol: unique symbol = Symbol.for("eigenutils.IDependency");

export enum DependencyState {
  Uninitialized,
  Initializing,
  Initialized
}

export interface IDependency extends IDisposable {
  [IDependencySymbol]: true;

  readonly dependencyState: DependencyState;
  readonly dependencyStateChanged: DualMultiArgEvent<[IDependency, DependencyState]>;
}

export function isIDependency(input: any): input is IDependency {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IDependencySymbol] === true;
}
