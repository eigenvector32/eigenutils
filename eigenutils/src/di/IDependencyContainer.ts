// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { DualMultiArgEvent } from "../emitter/DualMultiArgEmitter";
import { IDisposable } from "../IDisposable";
import { IDependency } from "./IDependency";

// The goal of this implementation of the very common idea of a dependency container is to be
// simple and do nothing that makes one stop and think "huh, that's clever. and weird".
// EG: using the same name as both a key and a typename as in FAST. Hence, using plain ole' strings for keys.

export const IDependencyContainerSymbol: unique symbol = Symbol.for("eigenutils.IDependencyContainer");

export enum DependencyContainerState {
  Uninitialized,
  Initializing,
  Initialized
}

export interface IDependencyContainer extends IDisposable {
  [IDependencyContainerSymbol]: true;

  readonly dependencyContainerState: DependencyContainerState;
  readonly dependencyContainerStateChanged: DualMultiArgEvent<[IDependencyContainer, DependencyContainerState]>;

  getInitializedPromise(): Promise<void>;

  addDependency(key: string, dependency: IDependency): void;
  readonly dependencyAdded: DualMultiArgEvent<[IDependencyContainer, string]>;

  removeDependency(key: string): void;
  readonly dependencyRemoved: DualMultiArgEvent<[IDependencyContainer, string]>;

  get(key: string): IDependency;
  getTyped<T extends IDependency>(key: string): T;
}

export function isIDependencyContainer(input: any): input is IDependencyContainer {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IDependencyContainerSymbol] === true;
}
