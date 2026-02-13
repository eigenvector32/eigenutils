// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IDependency, IDependencySymbol, DependencyState } from "./IDependency";
import { IDataNodeWithProperties, BaseDataNodeWithProperties } from "../data/IDataProperty";
import { MultiArgEmitter, MultiArgEvent } from "../emitter/MultiArgEmitter";
import { WeakMultiArgEmitter, WeakMultiArgEvent } from "../emitter/WeakMultiArgEmitter";

export const IDataNodeWithPropertiesDependencySymbol: unique symbol = Symbol.for("eigenutils.IDataNodeWithPropertiesDependency");

export interface IDataNodeWithPropertiesDependency extends IDependency, IDataNodeWithProperties {
    [IDataNodeWithPropertiesDependencySymbol]: true;
}

export function isIDataNodeWithPropertiesDependency(input: any): input is IDataNodeWithPropertiesDependency {
    if (input === null || input === undefined) {
        return false;
    }
    return input[IDataNodeWithPropertiesDependencySymbol] === true;
}

export class BaseDataNodeWithPropertiesDependency extends BaseDataNodeWithProperties implements IDataNodeWithPropertiesDependency {
    public readonly [IDependencySymbol] = true;
    public readonly [IDataNodeWithPropertiesDependencySymbol] = true;

    protected _dependencyState: DependencyState = DependencyState.Uninitialized;
    public get dependencyState(): DependencyState {
        return this._dependencyState;
    }

    protected _dependencyStateChangedEmitter: MultiArgEmitter<[IDependency, DependencyState]> | null = null;
    public get dependencyStateChanged(): MultiArgEvent<[IDependency, DependencyState]> {
        if (this._dependencyStateChangedEmitter === null) {
            this._dependencyStateChangedEmitter = new MultiArgEmitter<[IDependency, DependencyState]>()
        }
        return this._dependencyStateChangedEmitter.event;
    }

    protected _weakDependencyStateChangedEmitter: WeakMultiArgEmitter<[IDependency, DependencyState]> | null = null;
    public get weakDependencyStateChanged(): WeakMultiArgEvent<[IDependency, DependencyState]> {
        if (this._weakDependencyStateChangedEmitter === null) {
            this._weakDependencyStateChangedEmitter = new WeakMultiArgEmitter<[IDependency, DependencyState]>()
        }
        return this._weakDependencyStateChangedEmitter.event;
    }

    public override[Symbol.dispose](): void {
        super[Symbol.dispose]();
        this._dependencyStateChangedEmitter?.[Symbol.dispose]();
        this._weakDependencyStateChangedEmitter?.[Symbol.dispose]();
    }

    public override toString(): string {
        if (this._index === null) {
            return `BaseDataNodeWithPropertiesDependency(${this._nodeName},${this._dependencyState},${this._properties})`;
        }
        else {
            return `BaseDataNodeWithPropertiesDependency(${this._nodeName}[${this._index}],${this._dependencyState},${this._properties})`;
        }
    }
}