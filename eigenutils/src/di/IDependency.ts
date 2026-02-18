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
    public readonly [IDependencySymbol] = true;

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

    public [Symbol.dispose](): void {
        this._dependencyStateChangedEmitter?.[Symbol.dispose]();
    }

    public toString(): string {
        return `BaseDependency(${this._dependencyState})`;
    }
}
