// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IDisposable } from "../IDisposable";
import { FireMode } from "./FireMode";
import { VoidEmitter } from "./VoidEmitter";
import { WeakVoidEmitter } from "./WeakVoidEmitter";

export type DualVoidEvent = (target: () => void, context?: unknown | null, weak?: boolean) => IDisposable;

export class DualVoidEmitter implements IDisposable {
    constructor(fireMode: FireMode = FireMode.Synchronous) {
        this._fireMode = fireMode;
    }

    private _strongEmitter: VoidEmitter | null = null;
    private _weakEmitter: WeakVoidEmitter | null = null;
    private _event: DualVoidEvent | null = null;
    private _isDisposed: boolean = false;

    public get listenerCount(): number {
        if (this._isDisposed) {
            throw new Error("DualVoidEmitter.getlistenerCount called after dispose");
        }
        return (this._strongEmitter?.listenerCount ?? 0) + (this._weakEmitter?.listenerCount ?? 0);
    }

    public get strongListenerCount(): number {
        if (this._isDisposed) {
            throw new Error("DualVoidEmitter.getstrongListenerCount called after dispose");
        }
        return this._strongEmitter?.listenerCount ?? 0;
    }

    public get weakListenerCount(): number {
        if (this._isDisposed) {
            throw new Error("DualVoidEmitter.getweakListenerCount called after dispose");
        }
        return this._weakEmitter?.listenerCount ?? 0;
    }

    private _fireMode: FireMode;
    public set fireMode(value: FireMode) {
        if (this._isDisposed) {
            throw new Error("DualVoidEmitter.setfireMode called after dispose");
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
            throw new Error("DualVoidEmitter.getfireMode called after dispose");
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

    public get event(): DualVoidEvent {
        if (this._isDisposed) {
            throw new Error("DualVoidEmitter.getevent called after dispose");
        }
        if (this._event) {
            return this._event;
        }
        this._event = (target: () => void, context: unknown | null = null, weak: boolean = false): IDisposable => {
            if (weak === true) {
                if (this._weakEmitter === null) {
                    this._weakEmitter = new WeakVoidEmitter(this._fireMode);
                }
                return this._weakEmitter.event(target, context);
            }
            else {
                if (this._strongEmitter === null) {
                    this._strongEmitter = new VoidEmitter(this._fireMode);
                }
                return this._strongEmitter.event(target, context);
            }
        };
        return this._event;
    }

    public fire(): void {
        if (this._isDisposed) {
            throw new Error("DualVoidEmitter.fire called after dispose");
        }
        this._strongEmitter?.fire();
        this._weakEmitter?.fire();
    }

    public fireSynchronous(): void {
        if (this._isDisposed) {
            throw new Error("DualVoidEmitter.fireSynchronous called after dispose");
        }
        this._strongEmitter?.fireSynchronous();
        this._weakEmitter?.fireSynchronous();
    }

    public fireMicrotask(): void {
        if (this._isDisposed) {
            throw new Error("DualVoidEmitter.fireMicrotask called after dispose");
        }
        this._strongEmitter?.fireMicrotask();
        this._weakEmitter?.fireMicrotask();
    }

    public fireDebounce(): void {
        if (this._isDisposed) {
            throw new Error("DualVoidEmitter.fireDebounce called after dispose");
        }
        this._strongEmitter?.fireDebounce();
        this._weakEmitter?.fireDebounce();
    }

    public clear(): void {
        if (this._isDisposed) {
            throw new Error("DualVoidEmitter.clear called after dispose");
        }
        this._strongEmitter?.clear();
        this._weakEmitter?.clear();
    }
}

