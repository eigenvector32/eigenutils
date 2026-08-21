// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IDisposable } from "../IDisposable";
import {
  IWorkerTaskHostMessage,
  WorkerTaskHostMessageType,
  WorkerTaskClientMessageType,
  isIWorkerTaskHostMessage,
  IWorkerTaskHostDispatchMessage,
  IWorkerTaskClienDispatchMessage
} from "./IWorkerTaskMessage";

export class WorkerTaskClient implements IDisposable {
  constructor(windowObject: Window) {
    this._windowObject = windowObject;
    this._windowObject.addEventListener("message", this.processMessage);
    this._windowObject.addEventListener(
      "messageerror",
      this.onWindowObjectMessageError
    );
    this._windowObject.addEventListener(
      "unhandledrejection",
      this.onWindowObjectUnhandledRejection
    );
  }

  protected _windowObject: Window;

  protected processMessage = (message: MessageEvent): void => {
    if (isIWorkerTaskHostMessage(message.data)) {
      if (message.data.type === WorkerTaskHostMessageType.Handshake) {
        this.processHandshake(message.data);
      } else if (message.data.type === WorkerTaskHostMessageType.Shutdown) {
        this[Symbol.dispose]();
      } else if (message.data.type === WorkerTaskHostMessageType.DispatchTask) {
        this.processTaskMessageFromHost(
          message.data.type,
          message.data as IWorkerTaskHostDispatchMessage
        );
      } else {
        this.processMessageFromHost(message.data.type, message.data);
      }
    }
  };

  // Intended to be overridden
  protected processMessageFromHost(
    _type: string,
    _message: IWorkerTaskHostMessage
  ) {
    // NOP
  }

  // Intended to be overridden
  protected processTaskMessageFromHost(
    _type: string,
    _message: IWorkerTaskHostDispatchMessage
  ) {
    // NOP
  }

  protected sendTaskComplete(
    taskType: string,
    taskId: number,
    taskOutput: unknown
  ): void {
    const message: IWorkerTaskClienDispatchMessage = {
      type: WorkerTaskClientMessageType.TaskComplete,
      taskType,
      taskId,
      taskOutput
    };
    this._windowObject.postMessage(message);
  }

  // Intended to be overridden
  protected onWindowObjectMessageError = (_e: MessageEvent): void => {
    // NOP
  };

  // Intended to be overridden
  protected onWindowObjectUnhandledRejection = (
    _e: PromiseRejectionEvent
  ): void => {
    // NOP
  };

  protected processHandshake(_: IWorkerTaskHostMessage) {
    this._windowObject.postMessage({
      type: WorkerTaskClientMessageType.HandshakeReply
    });
  }

  protected _isDisposed: boolean = false;
  public [Symbol.dispose](): void {
    if (!this._isDisposed) {
      this._windowObject.removeEventListener("message", this.processMessage);
      this._windowObject.removeEventListener(
        "messageerror",
        this.onWindowObjectMessageError
      );
      this._windowObject.removeEventListener(
        "unhandledrejection",
        this.onWindowObjectUnhandledRejection
      );
      this._windowObject.postMessage({
        type: WorkerTaskClientMessageType.ShutdownComplete
      });
    }
  }
}
