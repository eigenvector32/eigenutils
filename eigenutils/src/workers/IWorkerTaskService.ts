// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IWorkerService, WorkerService } from "./IWorkerService";
import { DependencyState } from "../di/IDependency";
import { IWorkerTaskClientMessage, WorkerTaskHostMessageType, WorkerTaskClientMessageType, isIWorkerTasClientMessage } from "./IWorkerTaskMessage";
// import { DualEmitter, DualEvent } from "../emitter/DualEmitter";
// import { FireMode } from "../emitter/FireMode";

export const IWorkerTaskServiceSymbol: unique symbol = Symbol.for("eigenutils.IWorkerTaskService");
export const IWorkerTaskServiceKey: string = "eigenutils.IWorkerTaskService";

export interface IWorkerTaskService extends IWorkerService {
    [IWorkerTaskServiceSymbol]: true;
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

export class WorkerTaskService extends WorkerService implements IWorkerTaskService {
    public readonly [IWorkerTaskServiceSymbol] = true;

    public override toString(): string {
        if (this._isDisposed) {
            return "WorkerTaskService(disposed)";
        }
        return `WorkerTaskService(${String(this._worker)})`;
    }

    protected _messageState: WorkerTaskServiceMessageState = WorkerTaskServiceMessageState.WaitingForHandshake;

    protected override initializeWorker(): void {
        this._worker?.postMessage({ type: WorkerTaskHostMessageType.Handshake });
    }

    protected override processMessage(message: MessageEvent): void {
        if (isIWorkerTasClientMessage(message.data)) {
            switch (message.data.type) {
                case WorkerTaskClientMessageType.HandshakeReply:
                    this.processHandshakeReply(message.data);
                    break;
            }
        }
    }

    protected processHandshakeReply(_: IWorkerTaskClientMessage): void {
        if (this._messageState !== WorkerTaskServiceMessageState.WaitingForHandshake) {
            throw new Error(`Received handshake reply when messageState is ${this._messageState}`);
        }
        this._messageState = WorkerTaskServiceMessageState.Ready;
        this.setDependencyState(DependencyState.Initialized);
    }

    public override[Symbol.dispose](): void {
        if (!this._isDisposed) {
            // TODO
        }
        super[Symbol.dispose]();
    }
}