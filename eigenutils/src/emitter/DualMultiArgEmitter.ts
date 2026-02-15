// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IDisposable } from "../IDisposable";
import { FireMode } from "./FireMode";
import { MultiArgEmitter } from "./MultiArgEmitter";
import { WeakMultiArgEmitter } from "./WeakMultiArgEmitter";

export type DualMultiArgEvent<T extends unknown[]> = (target: (...args: T) => void, context?: unknown | null, weak?: boolean) => IDisposable;

export class DualMultiArgEmitter<T extends unknown[]> implements IDisposable {
    constructor(fireMode: FireMode = FireMode.Synchronous) {
        this._strongEmitter = new MultiArgEmitter<T>(fireMode);
        this._weakEmitter = new WeakMultiArgEmitter<T>(fireMode);
    }

    private _strongEmitter: MultiArgEmitter<T>;
    private _weakEmitter: WeakMultiArgEmitter<T>;
    private _event: DualMultiArgEvent<T> | null = null;
    private _isDisposed: boolean = false;

    public set firemode(value: FireMode) {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.setfiremode called after dispose");
        }
        this._strongEmitter.fireMode = value;
        this._weakEmitter.fireMode = value;
    }
    public get fireMode(): FireMode {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.getfiremode called after dispose");
        }
        return this._strongEmitter.fireMode;
    }

    public [Symbol.dispose](): void {
        if (!this._isDisposed) {
            this._strongEmitter[Symbol.dispose]();
            this._weakEmitter[Symbol.dispose]();
            this._event = null;
            this._isDisposed = true;
        }
    }

    public get event(): DualMultiArgEvent<T> {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.getevent called after dispose");
        }
        if (this._event) {
            return this._event;
        }
        this._event = (target: (...args: T) => void, context: unknown | null = null, weak: boolean = false): IDisposable => {
            if (weak === true) {
                return this._weakEmitter.event(target, context);
            }
            else {
                return this._strongEmitter.event(target, context);
            }
        };
        return this._event;
    }

    public fire(...args: T): void {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.fire called after dispose");
        }
        this._strongEmitter.fire(...args);
        this._weakEmitter.fire(...args);
    }

    public fireSynchronous(...args: T): void {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.fireSynchronous called after dispose");
        }
        this._strongEmitter.fireSynchronous(...args);
        this._weakEmitter.fireSynchronous(...args);
    }

    public fireMicrotask(...args: T): void {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.fireMicrotask called after dispose");
        }
        this._strongEmitter.fireMicrotask(...args);
        this._weakEmitter.fireMicrotask(...args);
    }

    public fireDebounce(...args: T): void {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.fireDebounce called after dispose");
        }
        this._strongEmitter.fireDebounce(...args);
        this._weakEmitter.fireDebounce(...args);
    }

    public clear(): void {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.clear called after dispose");
        }
        this._strongEmitter.clear();
        this._weakEmitter.clear();
    }
}

