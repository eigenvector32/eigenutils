import { IDisposable } from "../IDisposable";
import { FireMode } from "./FireMode";

export type WeakEvent<T> = (target: (arg: T) => void, context?: unknown | null) => IDisposable;

interface IWeakListener<T> {
    context: WeakRef<any> | null;
    target: WeakRef<(arg: T) => void>;
    listenerId: symbol;
}

function cloneWeakListeners<T>(input: IWeakListener<T>[]): IWeakListener<T>[] {
    const retVal: IWeakListener<T>[] = new Array(input.length);
    for (let i: number = 0; i < input.length; i++) {
        retVal[i] = { context: input[i].context, target: input[i].target, listenerId: input[i].listenerId };
    }
    return retVal;
}

export class WeakEmitter<T> implements IDisposable {
    constructor(fireMode: FireMode = FireMode.Synchronous) {
        this.fireMode = fireMode;
    }

    private _listeners: IWeakListener<T>[] = [];
    public get listenerCount(): number {
        if (this._isDisposed) {
            throw new Error("WeakEmitter.listenerCount called after dispose");
        }
        return this._listeners.length;
    }

    private _event: WeakEvent<T> | null = null;
    private _isDisposed: boolean = false;
    public fireMode: FireMode;

    public [Symbol.dispose](): void {
        if (!this._isDisposed) {
            this._event = null;
            this.clear();
            this._isDisposed = true;
        }
    }

    public get event(): WeakEvent<T> {
        if (this._isDisposed) {
            throw new Error("WeakEmitter.getevent called after dispose");
        }
        if (this._event) {
            return this._event;
        }

        this._event = (target: (arg: T) => void, context: unknown | null = null): IDisposable => {
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

    public fire(arg: T): void {
        if (this._isDisposed) {
            throw new Error("WeakEmitter.fire called after dispose");
        }
        if (this.fireMode & FireMode.Synchronous) {
            this.fireSynchronous(arg);
        }
        if (this.fireMode & FireMode.Microtask) {
            this.fireMicrotask(arg);
        }
        if (this.fireMode & FireMode.Debounce) {
            this.fireDebounce(arg);
        }
    }

    public fireSynchronous(arg: T): void {
        if (this._isDisposed) {
            throw new Error("WeakEmitter.fireSynchronous called after dispose");
        }
        if (this._listeners.length === 0) {
            return;
        }
        const fireTargets: IWeakListener<T>[] = cloneWeakListeners(this._listeners);
        for (let i: number = 0; i < fireTargets.length; i++) {
            const target: ((arg: T) => void) | undefined = fireTargets[i].target.deref();
            if (target) {
                let context: unknown | null = null;
                if (fireTargets[i].context !== null && fireTargets[i].context !== undefined) {
                    context = fireTargets[i].context!.deref();
                }
                target.apply(context, [arg]);
            }
            else {
                this.removeListener(fireTargets[i].listenerId);
            }
        }
    }

    public fireMicrotask(arg: T): void {
        if (this._isDisposed) {
            throw new Error("WeakEmitter.fireMicrotask called after dispose");
        }
        queueMicrotask((): void => {
            if (this._isDisposed || this._listeners.length === 0) {
                return;
            }
            const fireTargets: IWeakListener<T>[] = cloneWeakListeners(this._listeners);
            for (let i: number = 0; i < fireTargets.length; i++) {
                const target: ((arg: T) => void) | undefined = fireTargets[i].target.deref();
                if (target) {
                    let context: unknown | null = null;
                    if (fireTargets[i].context !== null && fireTargets[i].context !== undefined) {
                        context = fireTargets[i].context!.deref();
                    }
                    target.apply(context, [arg]);
                }
                else {
                    this.removeListener(fireTargets[i].listenerId);
                }
            }
        });
    }

    private _debounceArg: T | null = null;
    public fireDebounce(arg: T): void {
        if (this._isDisposed) {
            throw new Error("WeakEmitter.fireDebounce called after dispose");
        }
        if (this._debounceArg === null) {
            this._debounceArg = arg;
            queueMicrotask((): void => {
                if (this._isDisposed || this._debounceArg === null) {
                    return;
                }
                const a: T = this._debounceArg;
                this._debounceArg = null;
                if (this._listeners.length === 0) {
                    return;
                }
                const fireTargets: IWeakListener<T>[] = cloneWeakListeners(this._listeners);
                for (let i: number = 0; i < fireTargets.length; i++) {
                    const target: ((arg: T) => void) | undefined = fireTargets[i].target.deref();
                    if (target) {
                        let context: unknown | null = null;
                        if (fireTargets[i].context !== null && fireTargets[i].context !== undefined) {
                            context = fireTargets[i].context!.deref();
                        }
                        target.apply(context, [a]);
                    }
                    else {
                        this.removeListener(fireTargets[i].listenerId);
                    }
                }
            });
        }
        else {
            this._debounceArg = arg;
        }
    }

    public clear(): void {
        if (this._isDisposed) {
            throw new Error("WeakEmitter.clear called after dispose");
        }
        if (this._listeners.length > 0) {
            this._listeners = [];
        }
    }

    private addListener(target: (arg: T) => void, context: unknown | null = null): symbol {
        for (let i: number = 0; i < this._listeners.length; i++) {
            const t: ((arg: T) => void) | undefined = this._listeners[i].target.deref();
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