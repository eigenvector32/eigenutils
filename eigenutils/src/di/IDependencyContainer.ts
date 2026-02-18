// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { DualMultiArgEmitter, DualMultiArgEvent } from "../emitter/DualMultiArgEmitter";
import { IDisposable } from "../IDisposable";
import { DependencyState, IDependency } from "./IDependency";

// The goal of this implementation of the very common idea of a dependency container is to be
// simple and do nothing that makes one stop and think "huh, that's clever. and weird".
// EG: using the same name as both a key and a typename as in FAST. Hence, using plain ole' strings for keys.

export const IDependencyContainerSymbol: unique symbol = Symbol.for("eigenutils.IDependencyContainer");

export enum DependencyContainerState { Uninitialized, Initializing, Initialized };

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

interface IDependencyWrapper {
    dependency: IDependency;
    stateChangedToken: IDisposable;
}

export class BaseDependencyContainer implements IDependencyContainer {
    public toString(): string {
        if (this._isDisposed) {
            return "BaseDependencyContainer(disposed)";
        }
        return `BaseDependencyContainer(${this._dependencyContainerState},${this._dependencies.size})`;
    }

    public readonly [IDependencyContainerSymbol] = true;

    protected _dependencies: Map<string, IDependencyWrapper> = new Map<string, IDependencyWrapper>();

    protected _dependencyContainerState: DependencyContainerState = DependencyContainerState.Uninitialized;
    public get dependencyContainerState(): DependencyContainerState {
        if (this._isDisposed) {
            throw new Error("BaseDependencyContainer.getdependencyContainerState called after dispose");
        }
        return this._dependencyContainerState;
    }

    protected updateState(): void {
        let newState: DependencyContainerState = DependencyContainerState.Initialized;
        this._dependencies.forEach((d: IDependencyWrapper) => {
            switch (newState) {
                case DependencyContainerState.Initialized:
                    if (d.dependency.dependencyState === DependencyState.Initializing) {
                        newState = DependencyContainerState.Initializing;
                    }
                    else if (d.dependency.dependencyState === DependencyState.Uninitialized) {
                        newState = DependencyContainerState.Uninitialized;
                    }
                    break;
                case DependencyContainerState.Initializing:
                    if (d.dependency.dependencyState === DependencyState.Uninitialized) {
                        newState = DependencyContainerState.Uninitialized;
                    }
                    break;
            }
        });
        if (newState !== this._dependencyContainerState) {
            this._dependencyContainerState = newState;
            this._dependencyContainerStateChangedEmitter?.fire(this, this._dependencyContainerState);

            if (newState === DependencyContainerState.Initialized && this._initializedPromise !== null && this._initializedPromiseResolve !== null) {
                const resolve: () => void = this._initializedPromiseResolve;
                this._initializedPromiseResolve = null;
                this._initializedPromiseReject = null;
                this._initializedPromise = null;
                resolve();
            }
        }
    }

    protected _dependencyContainerStateChangedEmitter: DualMultiArgEmitter<[IDependencyContainer, DependencyContainerState]> | null = null;
    public get dependencyContainerStateChanged(): DualMultiArgEvent<[IDependencyContainer, DependencyContainerState]> {
        if (this._isDisposed) {
            throw new Error("BaseDependencyContainer.getdependencyContainerStateChanged called after dispose");
        }
        if (this._dependencyContainerStateChangedEmitter === null) {
            this._dependencyContainerStateChangedEmitter = new DualMultiArgEmitter<[IDependencyContainer, DependencyContainerState]>();
        }
        return this._dependencyContainerStateChangedEmitter.event;
    }

    protected _initializedPromiseResolve: (() => void) | null = null;
    protected _initializedPromiseReject: ((reason?: any) => void) | null = null;
    protected _initializedPromise: Promise<void> | null = null;
    public getInitializedPromise(): Promise<void> {
        if (this._isDisposed) {
            throw new Error("BaseDependencyContainer.getInitializedPromise called after dispose");
        }
        if (this._initializedPromise !== null) {
            return this._initializedPromise;
        }
        if (this.dependencyContainerState === DependencyContainerState.Initialized) {
            return Promise.resolve();
        }
        this._initializedPromise = new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
            this._initializedPromiseResolve = resolve;
            this._initializedPromiseReject = reject;
        });
        return this._initializedPromise;
    }

    public addDependency(key: string, dependency: IDependency): void {
        if (this._isDisposed) {
            throw new Error("BaseDependencyContainer.addDependency called after dispose");
        }
        if (this._dependencies.has(key)) {
            throw new Error(`Key ${key} already exists in the container`);
        }
        const stateChangedToken: IDisposable = dependency.dependencyStateChanged(this.onDependencyStateChanged, this);
        this._dependencies.set(key, { dependency, stateChangedToken });
        this.updateState();

        this._dependencyAddedEmitter?.fire(this, key);
    }

    protected onDependencyStateChanged(_source: IDependency, _state: DependencyState): void {
        this.updateState();
    }

    protected _dependencyAddedEmitter: DualMultiArgEmitter<[IDependencyContainer, string]> | null = null;
    public get dependencyAdded(): DualMultiArgEvent<[IDependencyContainer, string]> {
        if (this._isDisposed) {
            throw new Error("BaseDependencyContainer.getdependencyAdded called after dispose");
        }
        if (this._dependencyAddedEmitter === null) {
            this._dependencyAddedEmitter = new DualMultiArgEmitter<[IDependencyContainer, string]>();
        }
        return this._dependencyAddedEmitter.event;
    }

    public removeDependency(key: string): void {
        if (this._isDisposed) {
            throw new Error("BaseDependencyContainer.removeDependency called after dispose");
        }
        if (!this._dependencies.has(key)) {
            throw new Error(`Key ${key} does not exist in container`);
        }
        const oldDependency: IDependencyWrapper | undefined = this._dependencies.get(key);
        if (oldDependency === undefined) {
            throw new Error(`Key ${key} in container had value undefined`);
        }
        this._dependencies.delete(key);
        oldDependency.stateChangedToken[Symbol.dispose]();
        this.updateState();

        this._dependencyRemovedEmitter?.fire(this, key);
    }

    protected _dependencyRemovedEmitter: DualMultiArgEmitter<[IDependencyContainer, string]> | null = null;
    public get dependencyRemoved(): DualMultiArgEvent<[IDependencyContainer, string]> {
        if (this._isDisposed) {
            throw new Error("BaseDependencyContainer.getdependencyRemoved called after dispose");
        }
        if (this._dependencyRemovedEmitter === null) {
            this._dependencyRemovedEmitter = new DualMultiArgEmitter<[IDependencyContainer, string]>();
        }
        return this._dependencyRemovedEmitter.event;
    }

    public get(key: string): IDependency {
        if (this._isDisposed) {
            throw new Error("BaseDependencyContainer.get called after dispose");
        }
        if (!this._dependencies.has(key)) {
            throw new Error(`Key ${key} does not exist in container`);
        }
        const wrapper: IDependencyWrapper | undefined = this._dependencies.get(key);
        if (wrapper === undefined) {
            throw new Error(`Key ${key} in container had value undefined`);
        }
        return wrapper.dependency;
    }

    public getTyped<T extends IDependency>(key: string): T {
        if (this._isDisposed) {
            throw new Error("BaseDependencyContainer.getTyped called after dispose");
        }
        if (!this._dependencies.has(key)) {
            throw new Error(`Key ${key} does not exist in container`);
        }
        const wrapper: IDependencyWrapper | undefined = this._dependencies.get(key);
        if (wrapper === undefined) {
            throw new Error(`Key ${key} in container had value undefined`);
        }
        return wrapper.dependency as T;
    }

    protected _isDisposed: boolean = false;
    public [Symbol.dispose](): void {
        if (!this._isDisposed) {
            this._dependencyContainerStateChangedEmitter?.[Symbol.dispose]();
            this._dependencyAddedEmitter?.[Symbol.dispose]();
            this._dependencyRemovedEmitter?.[Symbol.dispose]();
            this._isDisposed = true;
        }
    }
}
