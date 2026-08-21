// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IWorkerService, WorkerService } from "./IWorkerService";
import { DependencyState } from "../di/IDependency";
import {
  IWorkerTaskClientMessage,
  WorkerTaskHostMessageType,
  WorkerTaskClientMessageType,
  isIWorkerTasClientMessage,
  IWorkerTaskClienDispatchMessage,
  IWorkerTaskHostDispatchMessage
} from "./IWorkerTaskMessage";

export const IWorkerTaskServiceSymbol: unique symbol = Symbol.for(
  "eigenutils.IWorkerTaskService"
);
export const IWorkerTaskServiceKey: string = "eigenutils.IWorkerTaskService";

export interface IWorkerTaskService extends IWorkerService {
  [IWorkerTaskServiceSymbol]: true;

  dispatch(taskType: string, taskInput: unknown): Promise<unknown>;
}

export function isIWorkerTaskService(input: any): input is IWorkerTaskService {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IWorkerTaskServiceSymbol] === true;
}

enum WorkerTaskServiceMessageState {
  WaitingForHandshake,
  Ready
}

interface ITaskInProgress {
  taskId: number;
  promise: Promise<unknown> | null;
  resolve: ((value: unknown) => void) | null;
  reject: ((reason?: any) => void) | null;
}

export class WorkerTaskService
  extends WorkerService
  implements IWorkerTaskService
{
  public readonly [IWorkerTaskServiceSymbol] = true;

  public override toString(): string {
    if (this._isDisposed) {
      return "WorkerTaskService(disposed)";
    }
    return `WorkerTaskService(${String(this._worker)})`;
  }

  protected _messageState: WorkerTaskServiceMessageState =
    WorkerTaskServiceMessageState.WaitingForHandshake;

  protected override initializeWorker(): void {
    this._worker?.postMessage({ type: WorkerTaskHostMessageType.Handshake });
  }

  // A Symbol would be better here but they cannot be automaticially serialized for postMessage
  // and so are a bit of a pain.
  protected _lastTaskId: number = 1;
  protected getNextTaskId(): number {
    this._lastTaskId++;
    return this._lastTaskId;
  }

  protected _tasksInProgress: ITaskInProgress[] = [];
  public dispatch(taskType: string, taskInput: unknown): Promise<unknown> {
    if (this._isDisposed) {
      throw new Error("Attempted to dispatch after dispose");
    }
    if (this._messageState !== WorkerTaskServiceMessageState.Ready) {
      throw new Error("Attempted to dispatch before ready");
    }
    if (this._worker === null) {
      throw new Error("Attempted to dispatch with no worker");
    }
    const taskId: number = this.getNextTaskId();
    const taskInProgress: ITaskInProgress = {
      taskId,
      promise: null,
      resolve: null,
      reject: null
    };
    const message: IWorkerTaskHostDispatchMessage = {
      type: WorkerTaskHostMessageType.DispatchTask,
      taskType,
      taskId,
      taskInput
    };
    this._worker.postMessage(message);
    const promise = new Promise<unknown>(
      (resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
        taskInProgress.resolve = resolve;
        taskInProgress.reject = reject;
      }
    );
    taskInProgress.promise = promise;
    this._tasksInProgress.push(taskInProgress);
    return promise;
  }

  protected processTaskComplete(message: IWorkerTaskClienDispatchMessage) {
    for (let i: number = 0; i < this._tasksInProgress.length; i++) {
      if (this._tasksInProgress[i].taskId === message.taskId) {
        const task: ITaskInProgress = this._tasksInProgress[i];
        this._tasksInProgress.splice(i, 1);
        this.finalizeTask(task, message.taskOutput);
        return;
      }
    }
    throw new Error(
      `Unexpected TaskComplete message with taskId ${message.taskId}`
    );
  }

  protected finalizeTask(task: ITaskInProgress, taskOutput: unknown) {
    if (task.resolve !== null) {
      task.resolve(taskOutput);
    }
  }

  protected override processMessage(message: MessageEvent): void {
    if (isIWorkerTasClientMessage(message.data)) {
      if (message.data.type === WorkerTaskClientMessageType.HandshakeReply) {
        this.processHandshakeReply(message.data);
      } else if (
        message.data.type === WorkerTaskClientMessageType.TaskComplete
      ) {
        this.processTaskComplete(
          message.data as IWorkerTaskClienDispatchMessage
        );
      } else {
        this.processMessageFromClient(message.data.type, message.data);
      }
    }
  }

  // Intended to be overridden
  protected processMessageFromClient(
    _type: string,
    _message: IWorkerTaskClientMessage
  ) {
    // NOP
  }

  protected processHandshakeReply(_: IWorkerTaskClientMessage): void {
    if (
      this._messageState !== WorkerTaskServiceMessageState.WaitingForHandshake
    ) {
      throw new Error(
        `Received handshake reply when messageState is ${this._messageState}`
      );
    }
    this._messageState = WorkerTaskServiceMessageState.Ready;
    this.setDependencyState(DependencyState.Initialized);
  }

  public override [Symbol.dispose](): void {
    if (!this._isDisposed) {
      if (this._worker !== null) {
        this._worker.postMessage({ type: WorkerTaskHostMessageType.Shutdown });
      }
    }
    super[Symbol.dispose]();
  }
}
