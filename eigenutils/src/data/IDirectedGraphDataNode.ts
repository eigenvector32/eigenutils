// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IDataNode, BaseDataNode } from "./IDataNode";
import { IDataProperty, IDataPropertyParent, IDataPropertyParentSymbol } from "./IDataProperty";

export const IDirectedGraphDataNodeSymbol: unique symbol = Symbol.for("eigenutils.IDirectedGraphDataNodeSymbol");

// Note that this implementation assumes this is an acyclic directed graph. Cycles will result in stack overflows.
export interface IDirectedGraphDataNode extends IDataNode, IDataPropertyParent {
    readonly [IDirectedGraphDataNodeSymbol]: true;
    readonly parents: IDataPropertyParent[];
    readonly children: IDataNode[];
    readonly properties: Map<string, IDataProperty<unknown>>;
}

export function isIDirectedGraphDataNode(input: any): input is IDirectedGraphDataNode {
    if (input === null || input === undefined) {
        return false;
    }
    return input[IDirectedGraphDataNodeSymbol] === true;
}

export class BaseDirectedGraphDataNode extends BaseDataNode implements IDirectedGraphDataNode {
    constructor(nodeName: string | null = null,
        index: number | null = null,
        parents: IDataPropertyParent[] = [],
        parentsGetSideEffect: (() => void) | null = null,
        childrenGetSideEffect: (() => void) | null = null,
        propertiesGetSideEffect: (() => void) | null = null,
        childPropertyChangedSideEffect: ((source: IDataProperty<unknown> | null, propertyName: string | null, index: number | null, path: IDataNode[]) => void) | null = null) {
        super(nodeName, index);

        this.parentsGetSideEffect = parentsGetSideEffect;
        this.childrenGetSideEffect = childrenGetSideEffect;
        this.propertiesGetSideEffect = propertiesGetSideEffect;
        this.childPropertyChangedSideEffect = childPropertyChangedSideEffect;

        this._parents = new Array<WeakRef<IDataPropertyParent>>(parents.length);
        for (let i: number = 0; i < parents.length; i++) {
            this._parents[i] = new WeakRef(parents[i]);
        }
    }

    public override toString(): string {
        if (this._isDisposed) {
            return "BaseDirectedGraphDataNode(disposed)";
        }
        if (this._index === null) {
            return `BaseDirectedGraphDataNode(${this._nodeName})`;
        }
        else {
            return `BaseDirectedGraphDataNode(${this._nodeName}[${this._index}])`;
        }
    }

    protected parentsGetSideEffect: (() => void) | null = null;
    protected childrenGetSideEffect: (() => void) | null = null;
    protected propertiesGetSideEffect: (() => void) | null = null;
    protected childPropertyChangedSideEffect: ((source: IDataProperty<unknown> | null, propertyName: string | null, index: number | null, path: IDataNode[]) => void) | null = null;

    public readonly [IDataPropertyParentSymbol] = true;
    public readonly [IDirectedGraphDataNodeSymbol] = true;

    protected _parents: WeakRef<IDataPropertyParent>[];
    public get parents(): IDataPropertyParent[] {
        this.parentsGetSideEffect?.call(this);
        const retVal: IDataPropertyParent[] = [];
        for (let i: number = 0; i < this._parents.length; i++) {
            const parentRef: IDataPropertyParent | undefined = this._parents[i].deref();
            if (parentRef) {
                retVal.push(parentRef);
            }
        }
        return retVal;
    }

    protected _children: IDataNode[] = [];
    public get children(): IDataNode[] {
        this.childrenGetSideEffect?.call(this);
        return this._children;
    }

    protected _properties: Map<string, IDataProperty<unknown>> = new Map<string, IDataProperty<unknown>>();
    public get properties(): Map<string, IDataProperty<unknown>> {
        this.propertiesGetSideEffect?.call(this);
        return this._properties;
    }

    public onChildPropertyChanged(source: IDataProperty<unknown> | null, propertyName: string | null, index: number | null, path: IDataNode[]): void {
        path.push(this);

        this.childPropertyChangedSideEffect?.call(this, source, propertyName, index, path);

        this._dataChangedEmitter?.fire(source, propertyName, index, path);

        for (let i: number = 0; i < this._parents.length; i++) {
            const parentRef: IDataPropertyParent | undefined = this._parents[i].deref();
            if (parentRef) {
                parentRef.onChildPropertyChanged(source, propertyName, index, path);
            }
        }
    }

    public override[Symbol.dispose](): void {
        if (!this._isDisposed) {
            for (let i: number = 0; i < this._children.length; i++) {
                this._children[i][Symbol.dispose]();
            }
            this._children = [];
            this._properties.forEach((prop: IDataProperty<unknown>, _: string) => {
                prop[Symbol.dispose]();
            });
            this._properties = new Map<string, IDataProperty<unknown>>();
            this._parents = [];
        }
        super[Symbol.dispose]();
    }
}
