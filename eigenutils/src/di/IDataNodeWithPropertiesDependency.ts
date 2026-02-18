// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IDependency, IDependencySymbol, DependencyState } from "./IDependency";
import { IDataNodeWithProperties, BaseDataNodeWithProperties } from "../data/IDataProperty";
import { DualMultiArgEmitter, DualMultiArgEvent } from "../emitter/DualMultiArgEmitter";

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
    public override toString(): string {
        if (this._isDisposed) {
            return "BaseDataNodeWithPropertiesDependency(disposed)";
        }
        if (this._index === null) {
            return `BaseDataNodeWithPropertiesDependency(${this._nodeName},${this._dependencyState},${this._properties})`;
        }
        else {
            return `BaseDataNodeWithPropertiesDependency(${this._nodeName}[${this._index}],${this._dependencyState},${this._properties})`;
        }
    }

    public readonly [IDependencySymbol] = true;
    public readonly [IDataNodeWithPropertiesDependencySymbol] = true;

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

    public override[Symbol.dispose](): void {
        if (!this._isDisposed) {
            this._dependencyStateChangedEmitter?.[Symbol.dispose]();
        }
        super[Symbol.dispose]();
    }
}