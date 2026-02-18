// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IDisposable } from "../IDisposable";
import { FireMode } from "./FireMode";
import { Emitter } from "./Emitter";
import { WeakEmitter } from "./WeakEmitter";

export type DualEvent<T> = (target: (arg: T) => void, context?: unknown | null, weak?: boolean) => IDisposable;

export class DualEmitter<T> implements IDisposable {
    constructor(fireMode: FireMode = FireMode.Synchronous) {
        this._fireMode = fireMode;
    }

    private _strongEmitter: Emitter<T> | null = null;
    private _weakEmitter: WeakEmitter<T> | null = null;
    private _event: DualEvent<T> | null = null;
    private _isDisposed: boolean = false;

    public get listenerCount(): number {
        if (this._isDisposed) {
            throw new Error("DualEmitter.getlistenerCount called after dispose");
        }
        return (this._strongEmitter?.listenerCount ?? 0) + (this._weakEmitter?.listenerCount ?? 0);
    }

    public get strongListenerCount(): number {
        if (this._isDisposed) {
            throw new Error("DualEmitter.getstrongListenerCount called after dispose");
        }
        return this._strongEmitter?.listenerCount ?? 0;
    }

    public get weakListenerCount(): number {
        if (this._isDisposed) {
            throw new Error("DualEmitter.getweakListenerCount called after dispose");
        }
        return this._weakEmitter?.listenerCount ?? 0;
    }

    private _fireMode: FireMode;
    public set fireMode(value: FireMode) {
        if (this._isDisposed) {
            throw new Error("DualEmitter.setfireMode called after dispose");
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
            throw new Error("DualEmitter.getfireMode called after dispose");
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

    public get event(): DualEvent<T> {
        if (this._isDisposed) {
            throw new Error("DualEmitter.getevent called after dispose");
        }
        if (this._event) {
            return this._event;
        }
        this._event = (target: (args: T) => void, context: unknown | null = null, weak: boolean = false): IDisposable => {
            if (weak === true) {
                if (this._weakEmitter === null) {
                    this._weakEmitter = new WeakEmitter<T>(this._fireMode);
                }
                return this._weakEmitter.event(target, context);
            }
            else {
                if (this._strongEmitter === null) {
                    this._strongEmitter = new Emitter<T>(this._fireMode);
                }
                return this._strongEmitter.event(target, context);
            }
        };
        return this._event;
    }

    public fire(arg: T): void {
        if (this._isDisposed) {
            throw new Error("DualEmitter.fire called after dispose");
        }
        this._strongEmitter?.fire(arg);
        this._weakEmitter?.fire(arg);
    }

    public fireSynchronous(arg: T): void {
        if (this._isDisposed) {
            throw new Error("DualEmitter.fireSynchronous called after dispose");
        }
        this._strongEmitter?.fireSynchronous(arg);
        this._weakEmitter?.fireSynchronous(arg);
    }

    public fireMicrotask(arg: T): void {
        if (this._isDisposed) {
            throw new Error("DualEmitter.fireMicrotask called after dispose");
        }
        this._strongEmitter?.fireMicrotask(arg);
        this._weakEmitter?.fireMicrotask(arg);
    }

    public fireDebounce(arg: T): void {
        if (this._isDisposed) {
            throw new Error("DualEmitter.fireDebounce called after dispose");
        }
        this._strongEmitter?.fireDebounce(arg);
        this._weakEmitter?.fireDebounce(arg);
    }

    public clear(): void {
        if (this._isDisposed) {
            throw new Error("DualEmitter.clear called after dispose");
        }
        this._strongEmitter?.clear();
        this._weakEmitter?.clear();
    }
}

