// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IDisposable } from "../IDisposable";
import { FireMode } from "./FireMode";
import { MultiArgEmitter } from "./MultiArgEmitter";
import { WeakMultiArgEmitter } from "./WeakMultiArgEmitter";

export type DualMultiArgEvent<T extends unknown[]> = (target: (...args: T) => void, context?: unknown | null, weak?: boolean) => IDisposable;

export class DualMultiArgEmitter<T extends unknown[]> implements IDisposable {
    constructor(fireMode: FireMode = FireMode.Synchronous) {
        this._fireMode = fireMode;
    }

    public toString(): string {
        if (this._isDisposed) {
            return "DualMultiArgEmitter(disposed)";
        }
        return `DualMultiArgEmitter(${this._strongEmitter?.listenerCount},${this._weakEmitter?.listenerCount})`;
    }

    private _strongEmitter: MultiArgEmitter<T> | null = null;
    private _weakEmitter: WeakMultiArgEmitter<T> | null = null;
    private _event: DualMultiArgEvent<T> | null = null;
    private _isDisposed: boolean = false;

    public get listenerCount(): number {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.getlistenerCount called after dispose");
        }
        return (this._strongEmitter?.listenerCount ?? 0) + (this._weakEmitter?.listenerCount ?? 0);
    }

    public get strongListenerCount(): number {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.getstrongListenerCount called after dispose");
        }
        return this._strongEmitter?.listenerCount ?? 0;
    }

    public get weakListenerCount(): number {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.getweakListenerCount called after dispose");
        }
        return this._weakEmitter?.listenerCount ?? 0;
    }

    private _fireMode: FireMode;
    public set fireMode(value: FireMode) {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.setfireMode called after dispose");
        }
        this._fireMode = value;
        if (this._strongEmitter !== null) {
            this._strongEmitter.fireMode = value;
        }
        if (this._weakEmitter !== null) {
            this._weakEmitter.fireMode = value;
        }
    }
    public get fireMode(): FireMode {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.getfireMode called after dispose");
        }
        return this._fireMode;
    }

    public [Symbol.dispose](): void {
        if (!this._isDisposed) {
            this._strongEmitter?.[Symbol.dispose]();
            this._weakEmitter?.[Symbol.dispose]();
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
                if (this._weakEmitter === null) {
                    this._weakEmitter = new WeakMultiArgEmitter<T>(this._fireMode);
                }
                return this._weakEmitter.event(target, context);
            }
            else {
                if (this._strongEmitter === null) {
                    this._strongEmitter = new MultiArgEmitter<T>(this._fireMode);
                }
                return this._strongEmitter.event(target, context);
            }
        };
        return this._event;
    }

    public fire(...args: T): void {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.fire called after dispose");
        }
        this._strongEmitter?.fire(...args);
        this._weakEmitter?.fire(...args);
    }

    public fireSynchronous(...args: T): void {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.fireSynchronous called after dispose");
        }
        this._strongEmitter?.fireSynchronous(...args);
        this._weakEmitter?.fireSynchronous(...args);
    }

    public fireMicrotask(...args: T): void {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.fireMicrotask called after dispose");
        }
        this._strongEmitter?.fireMicrotask(...args);
        this._weakEmitter?.fireMicrotask(...args);
    }

    public fireDebounce(...args: T): void {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.fireDebounce called after dispose");
        }
        this._strongEmitter?.fireDebounce(...args);
        this._weakEmitter?.fireDebounce(...args);
    }

    public clear(): void {
        if (this._isDisposed) {
            throw new Error("DualMultiArgEmitter.clear called after dispose");
        }
        this._strongEmitter?.clear();
        this._weakEmitter?.clear();
    }
}

