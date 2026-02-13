// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IDisposable } from "../IDisposable";
import { FireMode } from "./FireMode";

export type VoidEvent = (target: () => void, context?: unknown | null) => IDisposable;

interface IVoidListener {
    context: unknown | null;
    target: () => void;
}

function cloneVoidListeners(input: IVoidListener[]): IVoidListener[] {
    const retVal: IVoidListener[] = new Array(input.length);
    for (let i: number = 0; i < input.length; i++) {
        retVal[i] = { context: input[i].context, target: input[i].target };
    }
    return retVal;
}

export class VoidEmitter implements IDisposable {
    constructor(fireMode: FireMode = FireMode.Synchronous) {
        this.fireMode = fireMode;
    }

    private _listeners: IVoidListener[] = [];
    public get listenerCount(): number {
        if (this._isDisposed) {
            throw new Error("VoidEmitter.listenerCount called after dispose");
        }
        return this._listeners.length;
    }

    private _event: VoidEvent | null = null;
    private _isDisposed: boolean = false;
    public fireMode: FireMode;

    public [Symbol.dispose](): void {
        if (!this._isDisposed) {
            this._event = null;
            this.clear();
            this._isDisposed = true;
        }
    }

    public get event(): VoidEvent {
        if (this._isDisposed) {
            throw new Error("VoidEmitter.getevent called after dispose");
        }
        if (this._event) {
            return this._event;
        }

        this._event = (target: () => void, context: unknown | null = null): IDisposable => {
            this.addListener(target, context);
            const retVal: IDisposable = {
                [Symbol.dispose]: (): void => {
                    this.removeListener(target);
                },
            };
            return retVal;
        };

        return this._event;
    }

    public fire(): void {
        if (this._isDisposed) {
            throw new Error("VoidEmitter.fire called after dispose");
        }
        if (this.fireMode & FireMode.Synchronous) {
            this.fireSynchronous();
        }
        if (this.fireMode & FireMode.Microtask) {
            this.fireMicrotask();
        }
        if (this.fireMode & FireMode.Debounce) {
            this.fireDebounce();
        }
    }

    public fireSynchronous(): void {
        if (this._isDisposed) {
            throw new Error("VoidEmitter.fireSynchronous called after dispose");
        }
        if (this._listeners.length === 0) {
            return;
        }
        const fireTargets: IVoidListener[] = cloneVoidListeners(this._listeners);
        for (let i: number = 0; i < fireTargets.length; i++) {
            fireTargets[i].target.apply(fireTargets[i].context);
        }
    }

    public fireMicrotask(): void {
        if (this._isDisposed) {
            throw new Error("VoidEmitter.fireMicrotask called after dispose");
        }
        queueMicrotask((): void => {
            if (this._isDisposed || this._listeners.length === 0) {
                return;
            }
            const fireTargets: IVoidListener[] = cloneVoidListeners(this._listeners);
            for (let i: number = 0; i < fireTargets.length; i++) {
                fireTargets[i].target.apply(fireTargets[i].context);
            }
        });
    }

    private _debounceQueued: boolean = false;
    public fireDebounce(): void {
        if (this._isDisposed) {
            throw new Error("VoidEmitter.fireMicrotask called after dispose");
        }
        if (this._debounceQueued === false) {
            this._debounceQueued = true;
            queueMicrotask((): void => {
                if (this._isDisposed || this._listeners.length === 0) {
                    return;
                }
                this._debounceQueued = false;
                const fireTargets: IVoidListener[] = cloneVoidListeners(this._listeners);
                for (let i: number = 0; i < fireTargets.length; i++) {
                    fireTargets[i].target.apply(fireTargets[i].context);
                }
            });
        }
    }

    public clear(): void {
        if (this._isDisposed) {
            throw new Error("VoidEmitter.clear called after dispose");
        }
        if (this._listeners.length > 0) {
            this._listeners = [];
        }
    }

    private addListener(target: () => void, context: unknown | null = null): void {
        for (let i: number = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].target === target) {
                return;
            }
        }
        this._listeners.push({ target, context });
    }

    private removeListener(target: () => void): void {
        if (this._isDisposed) {
            // Not an error as it is valid to dispose an event listener after disposing the emitter
            return;
        }
        for (let i: number = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].target === target) {
                // Because addListener checks to make sure we never get duplicate listeners with the same target we can be lazy here
                // and stop after finding the first match
                this._listeners.splice(i, 1);
                return;
            }
        }
    }
}