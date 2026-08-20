// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import {
  IDependency,
  BaseDependency,
  DependencyState
} from "../di/IDependency";
import { DualEmitter, DualEvent } from "../emitter/DualEmitter";
import { FireMode } from "../emitter/FireMode";

export const IWorkerServiceSymbol: unique symbol = Symbol.for(
  "eigenutils.IWorkerService"
);
export const IWorkerServiceKey: string = "eigenutils.IWorkerService";

export interface IWorkerService extends IDependency {
  [IWorkerServiceSymbol]: true;

  // It would be cleaner for the argument here to be a string or URL and to create the worker
  // internally to this class. However, the fairly new support for workers in webpack 5
  // really needs the full statement with a literal string for the web worker source to
  // all be in one line in code. EG: new Worker(new URL('./webWorker.js', import.meta.url))
  // The loadWorker method will take ownership of the worker passed in and terminate it when
  // needed.
  loadWorker(worker: Worker): void;
  postMessage(message: unknown, options?: StructuredSerializeOptions): void;
  postMessageTransfer(message: unknown, transfer: Transferable[]): void;

  onMessage: DualEvent<MessageEvent>;
  onError: DualEvent<ErrorEvent>;
  onMessageError: DualEvent<Event>;
}

export function isIWorkerService(input: any): input is IWorkerService {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IWorkerServiceSymbol] === true;
}

export class WorkerService extends BaseDependency implements IWorkerService {
  constructor(
    worker: Worker | null = null,
    fireMode: FireMode = FireMode.Synchronous
  ) {
    super();
    this._fireMode = fireMode;
    if (worker) {
      this.loadWorker(worker);
    } else {
      this._dependencyState = DependencyState.Uninitialized;
    }
  }

  public readonly [IWorkerServiceSymbol] = true;

  public override toString(): string {
    if (this._isDisposed) {
      return "WorkerService(disposed)";
    }
    return `WorkerService(${String(this._worker)})`;
  }

  protected _fireMode: FireMode = FireMode.Synchronous;
  protected _worker: Worker | null = null;

  public loadWorker(worker: Worker): void {
    if (this._worker !== null) {
      throw new Error("Worker has already been created");
    }
    this._worker = worker;
    this._worker.addEventListener("message", this.onWorkerMessage);
    this._worker.addEventListener("error", this.onWorkerError);
    this._worker.addEventListener("messageerror", this.onWorkerMessageError);
    this.initializeWorker();
  }

  // Intended to be overridden
  protected initializeWorker(): void {
    this.setDependencyState(DependencyState.Initialized);
  }

  protected onWorkerMessage = (event: MessageEvent): void => {
    this.processMessage(event);
    this._onMessageEmitter?.fire(event);
  };

  // Intended to be overridden
  protected processMessage(_: MessageEvent): void {
    // NOP
  }

  protected _onMessageEmitter: DualEmitter<MessageEvent> | null = null;
  public get onMessage(): DualEvent<MessageEvent> {
    if (this._onMessageEmitter === null) {
      this._onMessageEmitter = new DualEmitter<MessageEvent>(this._fireMode);
    }
    return this._onMessageEmitter.event;
  }

  protected onWorkerError = (event: ErrorEvent): void => {
    this._onErrorEmitter?.fire(event);
  };

  protected _onErrorEmitter: DualEmitter<ErrorEvent> | null = null;
  public get onError(): DualEvent<ErrorEvent> {
    if (this._onErrorEmitter === null) {
      this._onErrorEmitter = new DualEmitter<ErrorEvent>(this._fireMode);
    }
    return this._onErrorEmitter.event;
  }

  protected onWorkerMessageError = (event: Event): void => {
    this._onMessageErrorEmitter?.fire(event);
  };

  protected _onMessageErrorEmitter: DualEmitter<Event> | null = null;
  public get onMessageError(): DualEvent<Event> {
    if (this._onMessageErrorEmitter === null) {
      this._onMessageErrorEmitter = new DualEmitter<Event>(this._fireMode);
    }
    return this._onMessageErrorEmitter.event;
  }

  public postMessage(
    message: unknown,
    options?: StructuredSerializeOptions
  ): void {
    if (this._worker === null) {
      throw new Error("No worker exists");
    }
    this._worker.postMessage(message, options);
  }

  public postMessageTransfer(message: unknown, transfer: Transferable[]): void {
    if (this._worker === null) {
      throw new Error("No worker exists");
    }
    this._worker.postMessage(message, transfer);
  }

  public override [Symbol.dispose](): void {
    if (!this._isDisposed) {
      if (this._worker !== null) {
        this._worker.removeEventListener("message", this.onWorkerMessage);
        this._worker.removeEventListener("error", this.onWorkerError);
        this._worker.removeEventListener(
          "messageerror",
          this.onWorkerMessageError
        );
        this._worker.terminate();
        this._worker = null;
      }
      this._dependencyStateChangedEmitter?.[Symbol.dispose]();
      this._isDisposed = true;
    }
    super[Symbol.dispose]();
  }
}
