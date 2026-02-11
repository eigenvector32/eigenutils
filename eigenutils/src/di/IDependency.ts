import { MultiArgEmitter, MultiArgEvent } from "../emitter/MultiArgEmitter";
import { WeakMultiArgEmitter, WeakMultiArgEvent } from "../emitter/WeakMultiArgEmitter";
import { IDisposable } from "../IDisposable";

export const IDependencySymbol: unique symbol = Symbol.for("eigenutils.IDependency");

export enum DependencyState { Uninitialized, Initializing, Initialized };

export interface IDependency extends IDisposable {
    [IDependencySymbol]: true;

    readonly dependencyState: DependencyState;
    readonly dependencyStateChanged: MultiArgEvent<[IDependency, DependencyState]>;
    readonly weakDependencyStateChanged: WeakMultiArgEvent<[IDependency, DependencyState]>;
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

    public [Symbol.dispose](): void {
        this._dependencyStateChangedEmitter?.[Symbol.dispose]();
        this._weakDependencyStateChangedEmitter?.[Symbol.dispose]();
    }

    public toString(): string {
        return `BaseDependency(${this._dependencyState})`;
    }
}
