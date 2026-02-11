import { IDisposable } from "../IDisposable";
import { FireMode } from "./FireMode";

export type MultiArgEvent<T extends unknown[]> = (target: (...args: T) => void, context?: unknown | null) => IDisposable;

interface IMultiArgListener<T extends unknown[]> {
    context: unknown | null;
    target: (...args: T) => void;
}

function cloneMultiArgListeners<T extends unknown[]>(input: IMultiArgListener<T>[]): IMultiArgListener<T>[] {
    const retVal: IMultiArgListener<T>[] = new Array(input.length);
    for (let i: number = 0; i < input.length; i++) {
        retVal[i] = { context: input[i].context, target: input[i].target };
    }
    return retVal;
}

export class MultiArgEmitter<T extends unknown[]> implements IDisposable {
    constructor(fireMode: FireMode = FireMode.Synchronous) {
        this.fireMode = fireMode;
    }

    private _listeners: IMultiArgListener<T>[] = [];
    public get listenerCount(): number {
        if (this._isDisposed) {
            throw new Error("MultiArgEmitter.listenerCount called after dispose");
        }
        return this._listeners.length;
    }

    private _event: MultiArgEvent<T> | null = null;
    private _isDisposed: boolean = false;
    public fireMode: FireMode;

    public [Symbol.dispose](): void {
        if (!this._isDisposed) {
            this._event = null;
            this.clear();
            this._isDisposed = true;
        }
    }

    public get event(): MultiArgEvent<T> {
        if (this._isDisposed) {
            throw new Error("MultiArgEmitter.getevent called after dispose");
        }
        if (this._event) {
            return this._event;
        }

        this._event = (target: (...args: T) => void, context: unknown | null = null): IDisposable => {
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

    public fire(...args: T): void {
        if (this._isDisposed) {
            throw new Error("MultiArgEmitter.fire called after dispose");
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
            throw new Error("MultiArgEmitter.fireSynchronous called after dispose");
        }
        if (this._listeners.length === 0) {
            return;
        }
        const fireTargets: IMultiArgListener<T>[] = cloneMultiArgListeners(this._listeners);
        for (let i: number = 0; i < fireTargets.length; i++) {
            fireTargets[i].target.apply(fireTargets[i].context, args);
        }
    }

    public fireMicrotask(...args: T): void {
        if (this._isDisposed) {
            throw new Error("MultiArgEmitter.fireMicrotask called after dispose");
        }
        queueMicrotask((): void => {
            if (this._isDisposed || this._listeners.length === 0) {
                return;
            }
            const fireTargets: IMultiArgListener<T>[] = cloneMultiArgListeners(this._listeners);
            for (let i: number = 0; i < fireTargets.length; i++) {
                fireTargets[i].target.apply(fireTargets[i].context, args);
            }
        });
    }

    private _debounceArgs: T | null = null;
    public fireDebounce(...args: T): void {
        if (this._isDisposed) {
            throw new Error("MultiArgEmitter.fireDebounce called after dispose");
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
                const fireTargets: IMultiArgListener<T>[] = cloneMultiArgListeners(this._listeners);
                for (let i: number = 0; i < fireTargets.length; i++) {
                    fireTargets[i].target.apply(fireTargets[i].context, a);
                }
            });
        }
        else {
            this._debounceArgs = args;
        }
    }

    public clear(): void {
        if (this._isDisposed) {
            throw new Error("MultiArgEmitter.clear called after dispose");
        }
        if (this._listeners.length > 0) {
            this._listeners = [];
        }
    }

    private addListener(target: (...args: T) => void, context: unknown | null = null): void {
        for (let i: number = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].target === target) {
                return;
            }
        }
        this._listeners.push({ target, context });
    }

    private removeListener(target: (...args: T) => void): void {
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