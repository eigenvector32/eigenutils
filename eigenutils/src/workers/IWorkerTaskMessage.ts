// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

export enum WorkerTaskHostMessageType {
  Handshake = "handshake",
  Shutdown = "shutdown",
  DispatchTask = "dispatchtask"
}

export enum WorkerTaskClientMessageType {
  HandshakeReply = "handshakereply",
  ShutdownComplete = "shutdowncomplete",
  TaskComplete = "taskcomplete"
}

export interface IWorkerTaskHostMessage {
  readonly type: WorkerTaskHostMessageType;
}

export interface IWorkerTaskHostDispatchMessage extends IWorkerTaskHostMessage {
  readonly taskId: Symbol;
  readonly taskInput: unknown;
}

export interface IWorkerTaskClientMessage {
  readonly type: WorkerTaskClientMessageType;
}

export interface IWorkerTaskClienDispatchMessage extends IWorkerTaskClientMessage {
  readonly taskId: number;
  readonly taskType: string;
  readonly taskOutput: unknown;
}

export function isIWorkerTaskHostMessage(
  input: any
): input is IWorkerTaskHostMessage {
  if (input === null || input === undefined || typeof input.type !== "string") {
    return false;
  }
  return true;
}

export function isIWorkerTasClientMessage(
  input: any
): input is IWorkerTaskClientMessage {
  if (input === null || input === undefined || typeof input.type !== "string") {
    return false;
  }
  return true;
}
