import { IDisposable } from "../IDisposable";
import { FireMode } from "./FireMode";

export type Event<T> = (target: (arg: T) => void, context?: unknown | null) => IDisposable;

interface IListener<T> {
  context: unknown | null;
  target: (arg: T) => void;
}

function cloneListeners<T>(input: IListener<T>[]): IListener<T>[] {
  const retVal: IListener<T>[] = new Array(input.length);
  for (let i: number = 0; i < input.length; i++) {
    retVal[i] = { context: input[i].context, target: input[i].target };
  }
  return retVal;
}

export class Emitter<T> implements IDisposable {
  constructor(fireMode: FireMode = FireMode.Synchronous) {
    this.fireMode = fireMode;
  }

  private _listeners: IListener<T>[] = [];
  public get listenerCount(): number {
    if (this._isDisposed) {
      throw new Error("Emitter.listenerCount called after dispose");
    }
    return this._listeners.length;
  }

  private _event: Event<T> | null = null;
  private _isDisposed: boolean = false;
  public fireMode: FireMode;

  public [Symbol.dispose](): void {
    if (!this._isDisposed) {
      this._event = null;
      this.clear();
      this._isDisposed = true;
    }
  }

  public get event(): Event<T> {
    if (this._isDisposed) {
      throw new Error("Emitter.getevent called after dispose");
    }
    if (this._event) {
      return this._event;
    }

    this._event = (target: (arg: T) => void, context: unknown | null = null): IDisposable => {
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

  public fire(arg: T): void {
    if (this._isDisposed) {
      throw new Error("Emitter.fire called after dispose");
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
      throw new Error("Emitter.fireSynchronous called after dispose");
    }
    if (this._listeners.length === 0) {
      return;
    }
    const fireTargets: IListener<T>[] = cloneListeners(this._listeners);
    for (let i: number = 0; i < fireTargets.length; i++) {
      fireTargets[i].target.apply(fireTargets[i].context, [arg]);
    }
  }

  public fireMicrotask(arg: T): void {
    if (this._isDisposed) {
      throw new Error("Emitter.fireMicrotask called after dispose");
    }
    queueMicrotask((): void => {
      if (this._isDisposed || this._listeners.length === 0) {
        return;
      }
      const fireTargets: IListener<T>[] = cloneListeners(this._listeners);
      for (let i: number = 0; i < fireTargets.length; i++) {
        fireTargets[i].target.apply(fireTargets[i].context, [arg]);
      }
    });
  }

  private _debounceArg: T | null = null;
  public fireDebounce(arg: T): void {
    if (this._isDisposed) {
      throw new Error("Emitter.fireDebounce called after dispose");
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
        const fireTargets: IListener<T>[] = cloneListeners(this._listeners);
        for (let i: number = 0; i < fireTargets.length; i++) {
          fireTargets[i].target.apply(fireTargets[i].context, [a]);
        }
      });
    }
    else {
      this._debounceArg = arg;
    }
  }

  public clear(): void {
    if (this._isDisposed) {
      throw new Error("Emitter.clear called after dispose");
    }
    if (this._listeners.length > 0) {
      this._listeners = [];
    }
  }

  private addListener(target: (arg: T) => void, context: unknown | null = null): void {
    for (let i: number = 0; i < this._listeners.length; i++) {
      if (this._listeners[i].target === target) {
        return;
      }
    }
    this._listeners.push({ target, context });
  }

  private removeListener(target: (arg: T) => void): void {
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