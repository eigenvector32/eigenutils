// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { DualMultiArgEmitter, DualMultiArgEvent } from "../emitter/DualMultiArgEmitter";
import { IDisposable } from "../IDisposable";

export const IDependencySymbol: unique symbol = Symbol.for("eigenutils.IDependency");

export enum DependencyState { Uninitialized, Initializing, Initialized };

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

export class BaseDependency implements IDependency {
    public toString(): string {
        if (this._isDisposed) {
            return "BaseDependency(disposed)";
        }
        return `BaseDependency(${this._dependencyState})`;
    }

    public readonly [IDependencySymbol] = true;

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
            this._dependencyStateChangedEmitter = new DualMultiArgEmitter<[IDependency, DependencyState]>()
        }
        return this._dependencyStateChangedEmitter.event;
    }

    protected _isDisposed: boolean = false;
    public [Symbol.dispose](): void {
        if (!this._isDisposed) {
            this._dependencyStateChangedEmitter?.[Symbol.dispose]();
            this._isDisposed = true;
        }
    }
}
