import { IDisposable } from "../IDisposable";
import { FireMode } from "./FireMode";

export type WeakVoidEvent = (target: () => void, context?: unknown | null) => IDisposable;

interface IWeakVoidListener {
    context: WeakRef<any> | null;
    target: WeakRef<() => void>;
    listenerId: symbol;
}

function cloneWeakVoidListeners(input: IWeakVoidListener[]): IWeakVoidListener[] {
    const retVal: IWeakVoidListener[] = new Array(input.length);
    for (let i: number = 0; i < input.length; i++) {
        retVal[i] = { context: input[i].context, target: input[i].target, listenerId: input[i].listenerId };
    }
    return retVal;
}

export class WeakVoidEmitter implements IDisposable {
    constructor(fireMode: FireMode = FireMode.Synchronous) {
        this.fireMode = fireMode;
    }

    private _listeners: IWeakVoidListener[] = [];
    public get listenerCount(): number {
        if (this._isDisposed) {
            throw new Error("WeakVoidEmitter.listenerCount called after dispose");
        }
        return this._listeners.length;
    }

    private _event: WeakVoidEvent | null = null;
    private _isDisposed: boolean = false;
    public fireMode: FireMode;

    public [Symbol.dispose](): void {
        if (!this._isDisposed) {
            this._event = null;
            this.clear();
            this._isDisposed = true;
        }
    }

    public get event(): WeakVoidEvent {
        if (this._isDisposed) {
            throw new Error("WeakVoidEmitter.getevent called after dispose");
        }
        if (this._event) {
            return this._event;
        }

        this._event = (target: () => void, context: unknown | null = null): IDisposable => {
            const listenerId: symbol = this.addListener(target, context);
            const retVal: IDisposable = {
                [Symbol.dispose]: (): void => {
                    this.removeListener(listenerId);
                },
            };
            return retVal;
        };

        return this._event;
    }

    public fire(): void {
        if (this._isDisposed) {
            throw new Error("WeakVoidEmitter.fire called after dispose");
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
            throw new Error("WeakVoidEmitter.fireSynchronous called after dispose");
        }
        if (this._listeners.length === 0) {
            return;
        }
        const fireTargets: IWeakVoidListener[] = cloneWeakVoidListeners(this._listeners);
        for (let i: number = 0; i < fireTargets.length; i++) {
            const target: (() => void) | undefined = fireTargets[i].target.deref();
            if (target) {
                let context: unknown | null = null;
                if (fireTargets[i].context !== null && fireTargets[i].context !== undefined) {
                    context = fireTargets[i].context!.deref();
                }
                target.apply(context);
            }
            else {
                this.removeListener(fireTargets[i].listenerId);
            }
        }
    }

    public fireMicrotask(): void {
        if (this._isDisposed) {
            throw new Error("WeakVoidEmitter.fireMicrotask called after dispose");
        }
        queueMicrotask((): void => {
            if (this._isDisposed || this._listeners.length === 0) {
                return;
            }
            const fireTargets: IWeakVoidListener[] = cloneWeakVoidListeners(this._listeners);
            for (let i: number = 0; i < fireTargets.length; i++) {
                const target: (() => void) | undefined = fireTargets[i].target.deref();
                if (target) {
                    let context: unknown | null = null;
                    if (fireTargets[i].context !== null && fireTargets[i].context !== undefined) {
                        context = fireTargets[i].context!.deref();
                    }
                    target.apply(context);
                }
                else {
                    this.removeListener(fireTargets[i].listenerId);
                }
            }
        });
    }

    private _debounceQueued: boolean = false;
    public fireDebounce(): void {
        if (this._isDisposed) {
            throw new Error("WeakMultiArgEmitter.fireDebounce called after dispose");
        }
        if (this._debounceQueued === false) {
            this._debounceQueued = true;
            queueMicrotask((): void => {
                if (this._isDisposed || this._listeners.length === 0) {
                    return;
                }
                this._debounceQueued = false;
                const fireTargets: IWeakVoidListener[] = cloneWeakVoidListeners(this._listeners);
                for (let i: number = 0; i < fireTargets.length; i++) {
                    const target: (() => void) | undefined = fireTargets[i].target.deref();
                    if (target) {
                        let context: unknown | null = null;
                        if (fireTargets[i].context !== null && fireTargets[i].context !== undefined) {
                            context = fireTargets[i].context!.deref();
                        }
                        target.apply(context);
                    }
                    else {
                        this.removeListener(fireTargets[i].listenerId);
                    }
                }
            });
        }
    }

    public clear(): void {
        if (this._isDisposed) {
            throw new Error("WeakVoidEmitter.clear called after dispose");
        }
        if (this._listeners.length > 0) {
            this._listeners = [];
        }
    }

    private addListener(target: () => void, context: unknown | null = null): symbol {
        for (let i: number = 0; i < this._listeners.length; i++) {
            const t: (() => void) | undefined = this._listeners[i].target.deref();
            if (t === target) {
                return this._listeners[i].listenerId;
            }
        }
        const listenerId: symbol = Symbol();
        this._listeners.push({ target: new WeakRef(target), context: (context !== undefined && context !== null) ? new WeakRef(context) : null, listenerId });
        return listenerId;
    }

    private removeListener(id: symbol): void {
        if (this._isDisposed) {
            // Not an error as it is valid to dispose an event listener after disposing the emitter
            return;
        }
        for (let i: number = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].listenerId === id) {
                this._listeners.splice(i, 1);
                return;
            }
        }
    }
}
