import { IDisposable } from "../IDisposable";
import { FireMode } from "./FireMode";

export type WeakMultiArgEvent<T extends unknown[]> = (target: (...args: T) => void, context?: unknown | null) => IDisposable;

interface IWeakMultiArgListener<T extends unknown[]> {
    context: WeakRef<any> | null;
    target: WeakRef<(...args: T) => void>;
    listenerId: symbol;
}

function cloneWeakMultiArgListeners<T extends unknown[]>(input: IWeakMultiArgListener<T>[]): IWeakMultiArgListener<T>[] {
    const retVal: IWeakMultiArgListener<T>[] = new Array(input.length);
    for (let i: number = 0; i < input.length; i++) {
        retVal[i] = { context: input[i].context, target: input[i].target, listenerId: input[i].listenerId };
    }
    return retVal;
}

export class WeakMultiArgEmitter<T extends unknown[]> implements IDisposable {
    constructor(fireMode: FireMode = FireMode.Synchronous) {
        this.fireMode = fireMode;
    }

    private _listeners: IWeakMultiArgListener<T>[] = [];
    public get listenerCount(): number {
        if (this._isDisposed) {
            throw new Error("WeakMultiArgEmitter.listenerCount called after dispose");
        }
        return this._listeners.length;
    }

    private _event: WeakMultiArgEvent<T> | null = null;
    private _isDisposed: boolean = false;
    public fireMode: FireMode;

    public [Symbol.dispose](): void {
        if (!this._isDisposed) {
            this._event = null;
            this.clear();
            this._isDisposed = true;
        }
    }

    public get event(): WeakMultiArgEvent<T> {
        if (this._isDisposed) {
            throw new Error("WeakMultiArgEmitter.getevent called after dispose");
        }
        if (this._event) {
            return this._event;
        }

        this._event = (target: (...args: T) => void, context: unknown | null): IDisposable => {
            const listenerId = this.addListener(target, context);
            const retVal: IDisposable = {
                [Symbol.dispose]: (): void => {
                    this.removeListener(listenerId);
                },
            };
            return retVal;
        };

        return this._event;
    }

    public fire(...args: T): void {
        if (this._isDisposed) {
            throw new Error("WeakMultiArgEmitter.fire called after dispose");
        }
        if (this.fireMode & FireMode.Synchronous) {
            this.fireSynchronous(...args);
        }
        if (this.fireMode & FireMode.Microtask) {
            this.fireMicrotask(...args);
        }
        if (this.fireMode & FireMode.Debounce) {
            this.fireDebounce(...args);
        }
    }

    public fireSynchronous(...args: T): void {
        if (this._isDisposed) {
            throw new Error("WeakMultiArgEmitter.fireSynchronous called after dispose");
        }
        if (this._listeners.length === 0) {
            return;
        }
        const fireTargets: IWeakMultiArgListener<T>[] = cloneWeakMultiArgListeners(this._listeners);
        for (let i: number = 0; i < fireTargets.length; i++) {
            const target: ((...args: T) => void) | undefined = fireTargets[i].target.deref();
            if (target) {
                let context: unknown | null = null;
                if (fireTargets[i].context !== null && fireTargets[i].context !== undefined) {
                    context = fireTargets[i].context!.deref();
                }
                target.apply(context, args);
            }
            else {
                this.removeListener(fireTargets[i].listenerId);
            }
        }
    }

    public fireMicrotask(...args: T): void {
        if (this._isDisposed) {
            throw new Error("WeakMultiArgEmitter.fireMicrotask called after dispose");
        }
        queueMicrotask((): void => {
            if (this._isDisposed || this._listeners.length === 0) {
                return;
            }
            const fireTargets: IWeakMultiArgListener<T>[] = cloneWeakMultiArgListeners(this._listeners);
            for (let i: number = 0; i < fireTargets.length; i++) {
                const target: ((...args: T) => void) | undefined = fireTargets[i].target.deref();
                if (target) {
                    let context: unknown | null = null;
                    if (fireTargets[i].context !== null && fireTargets[i].context !== undefined) {
                        context = fireTargets[i].context!.deref();
                    }
                    target.apply(context, args);
                }
                else {
                    this.removeListener(fireTargets[i].listenerId);
                }
            }
        });
    }

    private _debounceArgs: T | null = null;
    public fireDebounce(...args: T): void {
        if (this._isDisposed) {
            throw new Error("WeakMultiArgEmitter.fireDebounce called after dispose");
        }
        if (this._debounceArgs === null) {
            this._debounceArgs = args;
            queueMicrotask((): void => {
                if (this._isDisposed || this._debounceArgs === null) {
                    return;
                }
                const a: T = this._debounceArgs;
                this._debounceArgs = null;
                if (this._listeners.length === 0) {
                    return;
                }
                const fireTargets: IWeakMultiArgListener<T>[] = cloneWeakMultiArgListeners(this._listeners);
                for (let i: number = 0; i < fireTargets.length; i++) {
                    const target: ((...args: T) => void) | undefined = fireTargets[i].target.deref();
                    if (target) {
                        let context: unknown | null = null;
                        if (fireTargets[i].context !== null && fireTargets[i].context !== undefined) {
                            context = fireTargets[i].context!.deref();
                        }
                        target.apply(context, a);
                    }
                    else {
                        this.removeListener(fireTargets[i].listenerId);
                    }
                }
            });
        }
        else {
            this._debounceArgs = args;
        }
    }

    public clear(): void {
        if (this._isDisposed) {
            throw new Error("WeakMultiArgEmitter.clear called after dispose");
        }
        if (this._listeners.length > 0) {
            this._listeners = [];
        }
    }

    private addListener(target: (...args: T) => void, context: unknown | null): symbol {
        for (let i: number = 0; i < this._listeners.length; i++) {
            const t: ((...args: T) => void) | undefined = this._listeners[i].target.deref();
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