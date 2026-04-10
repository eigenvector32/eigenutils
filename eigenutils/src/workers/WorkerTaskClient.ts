// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IWorkerTaskHostMessage, WorkerTaskHostMessageType, WorkerTaskClientMessageType, isIWorkerTaskHostMessage } from "./IWorkerTaskMessage";

export class WorkerTaskClient {
    public processMessage(message: MessageEvent): void {
        if (isIWorkerTaskHostMessage(message.data)) {
            console.log(`WorkerTaskClient.processMessage: ${message.data.type}`);
            switch (message.data.type) {
                case WorkerTaskHostMessageType.Handshake:
                    this.processHandshake(message.data);
                    break;
            }
        }
    }

    protected processHandshake(_: IWorkerTaskHostMessage) {
        postMessage({ type: WorkerTaskClientMessageType.HandshakeReply });
    }
}

