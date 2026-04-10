// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

export enum WorkerTaskHostMessageType {
    Handshake = "handshake"
}

export enum WorkerTaskClientMessageType {
    HandshakeReply = "handshakereply"
}

export interface IWorkerTaskHostMessage {
    readonly type: WorkerTaskHostMessageType;
    readonly channel?: Symbol;
}

export interface IWorkerTaskClientMessage {
    readonly type: WorkerTaskClientMessageType;
    readonly channel?: Symbol;
}

export function isIWorkerTaskHostMessage(input: any): input is IWorkerTaskHostMessage {
    if (input === null || input === undefined || typeof (input.type) !== "string") {
        return false;
    }
    return Object.values(WorkerTaskHostMessageType).includes(input.type);
}

export function isIWorkerTasClientMessage(input: any): input is IWorkerTaskClientMessage {
    if (input === null || input === undefined || typeof (input.type) !== "string") {
        return false;
    }
    return Object.values(WorkerTaskClientMessageType).includes(input.type);
}