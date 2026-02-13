// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IDisposable } from "../IDisposable";
import { FireMode } from "../emitter/FireMode";
import { MultiArgEmitter, MultiArgEvent } from "../emitter/MultiArgEmitter";
import { WeakMultiArgEmitter, WeakMultiArgEvent } from "../emitter/WeakMultiArgEmitter";

export const IDataNodeSymbol: unique symbol = Symbol.for("eigenutils.IDataNodeSymbol");

export interface IDataNode extends IDisposable {
    [IDataNodeSymbol]: true;
    nodeName: string | null;
    index: number | null;
    fireMode: FireMode;
    readonly dataChanged: MultiArgEvent<[IDataNode | null, string | null, number | null, IDataNode[]]>;
    readonly weakDataChanged: WeakMultiArgEvent<[IDataNode | null, string | null, number | null, IDataNode[]]>;
}

export function isIDataNode(input: any): input is IDataNode {
    if (input === null || input === undefined) {
        return false;
    }
    return input[IDataNodeSymbol] === true;
}

export class BaseDataNode implements IDataNode {
    constructor(nodeName: string | null = null, index: number | null = null) {
        this._nodeName = nodeName;
        this._index = index;
    }

    public readonly [IDataNodeSymbol] = true;

    protected _nodeName: string | null;
    public get nodeName(): string | null {
        return this._nodeName;
    }
    public set nodeName(value: string | null) {
        this._nodeName = value;
    }

    protected _index: number | null;
    public get index(): number | null {
        return this._index;
    }
    public set index(value: number | null) {
        this._index = value;
    }

    protected _fireMode = FireMode.Debounce;
    public get fireMode(): FireMode {
        return this._fireMode;
    }
    public set fireMode(value: FireMode) {
        if (value !== this._fireMode) {
            this._fireMode = value;
            if (this._dataChangedEmitter) {
                this._dataChangedEmitter.fireMode = this._fireMode;
            }
            if (this._weakDataChangedEmitter) {
                this._weakDataChangedEmitter.fireMode = this._fireMode;
            }
        }
    }

    protected _dataChangedEmitter: MultiArgEmitter<[IDataNode | null, string | null, number | null, IDataNode[]]> | null = null;
    public get dataChanged(): MultiArgEvent<[IDataNode | null, string | null, number | null, IDataNode[]]> {
        if (this._dataChangedEmitter === null) {
            this._dataChangedEmitter = new MultiArgEmitter<[IDataNode | null, string | null, number | null, IDataNode[]]>(this._fireMode);
        }
        return this._dataChangedEmitter.event;
    }

    protected _weakDataChangedEmitter: WeakMultiArgEmitter<[IDataNode | null, string | null, number | null, IDataNode[]]> | null = null;
    public get weakDataChanged(): WeakMultiArgEvent<[IDataNode | null, string | null, number | null, IDataNode[]]> {
        if (this._weakDataChangedEmitter === null) {
            this._weakDataChangedEmitter = new WeakMultiArgEmitter<[IDataNode | null, string | null, number | null, IDataNode[]]>(this._fireMode);
        }
        return this._weakDataChangedEmitter.event;
    }

    public [Symbol.dispose](): void {
        this._dataChangedEmitter?.[Symbol.dispose]();
        this._weakDataChangedEmitter?.[Symbol.dispose]();
    }

    public toString(): string {
        if (this._index === null) {
            return `BaseDataNode(${this._nodeName})`;
        }
        else {
            return `BaseDataNode(${this._nodeName}[${this._index}])`;
        }
    }
}