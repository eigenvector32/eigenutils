// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { isDisposable } from "../IDisposable";
import { IDataNode, BaseDataNode } from "./IDataNode";
import { FireMode } from "../emitter/FireMode";
import { DualMultiArgEmitter, DualMultiArgEvent } from "../emitter/DualMultiArgEmitter";

export const IDataPropertyParentSymbol: unique symbol = Symbol.for("eigenutils.IDataPropertyParentSymbol");

export interface IDataPropertyParent {
    readonly [IDataPropertyParentSymbol]: true;
    onChildPropertyChanged(source: IDataProperty<unknown> | null, propertyName: string | null, index: number | null, path: IDataNode[]): void;
}

export function isIDataPropertyParent(input: any): input is IDataPropertyParent {
    if (input === null || input === undefined) {
        return false;
    }
    return input[IDataPropertyParentSymbol] === true;
}

export const IReadonlyDataPropertySymbol: unique symbol = Symbol.for("eigenutils.IReadonlyDataPropertySymbol");

export function isIReadonlyDataProperty(input: any): input is IReadonlyDataProperty<unknown> {
    if (input === null || input === undefined) {
        return false;
    }
    return input[IReadonlyDataPropertySymbol] === true;
}

export interface IReadonlyDataProperty<T> extends IDataNode {
    readonly [IReadonlyDataPropertySymbol]: true;
    readonly parent: IDataPropertyParent | null;
    readonly value: T;
    readonly isValid: boolean;
    readonly isValidChanged: DualMultiArgEvent<[IDataProperty<T>, boolean]>;
}


export const IDataPropertySymbol: unique symbol = Symbol.for("eigenutils.IDataPropertySymbol");

export function isIDataProperty(input: any): input is IDataProperty<unknown> {
    if (input === null || input === undefined) {
        return false;
    }
    return input[IDataPropertySymbol] === true;
}

export interface IDataProperty<T> extends IReadonlyDataProperty<T> {
    readonly [IDataPropertySymbol]: true;
    readonly parent: IDataPropertyParent | null;
    value: T;
    readonly isValid: boolean;
    readonly isValidChanged: DualMultiArgEvent<[IDataProperty<T>, boolean]>;
}

export class BaseDataProperty<T> extends BaseDataNode implements IDataProperty<T> {
    constructor(value: T,
        nodeName: string | null = null,
        index: number | null = null,
        parent: IDataPropertyParent | null = null,
        valueChangedSideEffect: (() => void) | null = null,
        valueGetSideEffect: (() => void) | null = null,
        validateImpl: (() => void) | null = null,
        isValidChangedSideEffect: (() => void) | null = null,
        isValidGetSideEffect: (() => void) | null = null
    ) {
        super(nodeName, index);

        this.valueChangedSideEffect = valueChangedSideEffect;
        this.valueGetSideEffect = valueGetSideEffect;
        this.validateImpl = validateImpl;
        this.isValidChangedSideEffect = isValidChangedSideEffect;
        this.isValidGetSideEffect = isValidGetSideEffect;

        this._value = value;
        if (parent) {
            this._parent = new WeakRef<IDataPropertyParent>(parent);
        }
        else {
            // The else statement here is due to the ts compiler not figuring out that _parent was definitively assigned otherwise
            this._parent = null;
        }
        this.validate(false);
    }

    public override toString(): string {
        if (this._isDisposed) {
            return "BaseDataProperty(disposed)";
        }
        if (this._index === null) {
            return `BaseDataProperty(${this._nodeName}, ${this._value})`;
        }
        else {
            return `BaseDataProperty(${this._nodeName}[${this._index}], ${this._value})`;
        }
    }

    protected valueChangedSideEffect: (() => void) | null = null;
    protected valueGetSideEffect: (() => void) | null = null;
    protected validateImpl: (() => void) | null = null;
    protected isValidChangedSideEffect: (() => void) | null = null;
    protected isValidGetSideEffect: (() => void) | null = null;

    public readonly [IReadonlyDataPropertySymbol] = true;
    public readonly [IDataPropertySymbol] = true;

    public override set fireMode(value: FireMode) {
        super.fireMode = value;
        if (value !== this._fireMode) {
            this._fireMode = value;
            if (this._isValidChangedEmitter) {
                this._isValidChangedEmitter.fireMode = this._fireMode;
            }
        }
    }

    protected _parent: WeakRef<IDataPropertyParent> | null;
    public get parent(): IDataPropertyParent | null {
        const parentRef: IDataPropertyParent | undefined | null = this._parent?.deref();
        if (parentRef) {
            return parentRef;
        }
        return null;
    }

    protected _value: T;
    public get value(): T {
        this.valueGetSideEffect?.call(this);
        return this._value;
    }
    public set value(newVal: T) {
        if (this._value !== newVal) {
            this._value = newVal;
            this.valueChangedSideEffect?.call(this);
            this.validate(true);
            this._dataChangedEmitter?.fire(this, this._nodeName, this._index, [this]);
            const parentRef: IDataPropertyParent | undefined | null = this._parent?.deref();
            if (parentRef) {
                parentRef.onChildPropertyChanged(this, this._nodeName, this._index, [this]);
            }
        }
    }

    protected validate(notify: boolean = true): void {
        const oldVal: boolean = this._isValid;
        this.validateImpl?.call(this);
        if (notify && (oldVal !== this._isValid)) {
            this.isValidChangedSideEffect?.call(this);
            this._isValidChangedEmitter?.fire(this, this._isValid);
        }
    }

    protected _isValid: boolean = true;
    public get isValid(): boolean {
        return this._isValid;
    }

    protected _isValidChangedEmitter: DualMultiArgEmitter<[IDataProperty<T>, boolean]> | null = null;
    public get isValidChanged(): DualMultiArgEvent<[IDataProperty<T>, boolean]> {
        if (this._isValidChangedEmitter === null) {
            this._isValidChangedEmitter = new DualMultiArgEmitter<[IDataProperty<T>, boolean]>(this._fireMode);
        }
        return this._isValidChangedEmitter.event;
    }

    public override[Symbol.dispose](): void {
        if (!this._isDisposed) {
            if (isDisposable(this._value)) {
                this._value[Symbol.dispose]();
            }
            this._isValidChangedEmitter?.[Symbol.dispose]();
            this._parent = null;
        }
        super[Symbol.dispose]();
    }
}

export const IDataNodeWithPropertiesSymbol: unique symbol = Symbol.for("eigenutils.IDataNodeWithPropertiesSymbol");

export interface IDataNodeWithProperties extends IDataPropertyParent, IDataNode {
    readonly [IDataNodeWithPropertiesSymbol]: true;
    readonly properties: Map<string, IDataProperty<unknown>>;
}

export function isIDataNodeWithProperties(input: any): input is IDataNodeWithProperties {
    if (input === null || input === undefined) {
        return false;
    }
    return input[IDataNodeWithPropertiesSymbol] === true;
}

export class BaseDataNodeWithProperties extends BaseDataNode implements IDataNodeWithProperties {
    constructor(nodeName: string | null = null,
        index: number | null = null,
        propertiesGetSideEffect: (() => void) | null = null,
        childPropertyChangedSideEffect: ((_source: IDataProperty<unknown> | null, _propertyName: string | null, _index: number | null, _path: IDataNode[]) => void) | null = null
    ) {
        super(nodeName, index);
        this.propertiesGetSideEffect = propertiesGetSideEffect;
        this.childPropertyChangedSideEffect = childPropertyChangedSideEffect;
    }

    public override toString(): string {
        if (this._isDisposed) {
            return "BaseDataNodeWithProperties(disposed)";
        }
        if (this._index === null) {
            return `BaseDataNodeWithProperties(${this._nodeName},${this._properties})`;
        }
        else {
            return `BaseDataNodeWithProperties(${this._nodeName}[${this._index}],${this._properties})`;
        }
    }

    public readonly [IDataNodeWithPropertiesSymbol] = true;
    public readonly [IDataPropertyParentSymbol] = true;

    protected _properties: Map<string, IDataProperty<unknown>> = new Map<string, IDataProperty<unknown>>();
    public get properties(): Map<string, IDataProperty<unknown>> {
        this.propertiesGetSideEffect?.call(this);
        return this._properties;
    }

    protected propertiesGetSideEffect: (() => void) | null = null;

    public onChildPropertyChanged(source: IDataProperty<unknown> | null, propertyName: string | null, index: number | null, path: IDataNode[]): void {
        path.push(this);

        this.childPropertyChangedSideEffect?.call(this, source, propertyName, index, path);

        this._dataChangedEmitter?.fire(source, propertyName, index, path);
    }

    protected childPropertyChangedSideEffect: ((_source: IDataProperty<unknown> | null, _propertyName: string | null, _index: number | null, _path: IDataNode[]) => void) | null = null;

    public override[Symbol.dispose](): void {
        if (!this._isDisposed) {
            this._properties.forEach((prop: IDataProperty<unknown>, _: string) => {
                prop[Symbol.dispose]();
            });
            this._properties = new Map<string, IDataProperty<unknown>>();
        }
        super[Symbol.dispose]();
    }
}
