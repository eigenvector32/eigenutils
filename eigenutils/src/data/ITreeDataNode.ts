import { IDataNode } from "./IDataNode";
import { IDataProperty, IDataPropertyParent, IDataNodeWithProperties, BaseDataNodeWithProperties } from "./IDataProperty";

export const ITreeDataNodeSymbol: unique symbol = Symbol.for("eigentuls.ITreeDataNodeSymbol");

export interface ITreeDataNode extends IDataNodeWithProperties, IDataPropertyParent {
    readonly parent: IDataPropertyParent | null;
    readonly children: IDataNode[];
}

export function isITreeDataNode(input: any): input is ITreeDataNode {
    if (input === null || input === undefined) {
        return false;
    }
    return input[ITreeDataNodeSymbol] === true;
}

// Note that this implementation assumes this is an acyclic tree. Cycles will result in stack overflows.
export class BaseTreeDataNode extends BaseDataNodeWithProperties implements ITreeDataNode {
    constructor(nodeName: string | null = null,
        index: number | null = null,
        parent: IDataPropertyParent | null = null,
        propertiesGetSideEffect: (() => void) | null = null,
        childPropertyChangedSideEffect: ((_source: IDataProperty<unknown> | null, _propertyName: string | null, _index: number | null, _path: IDataNode[]) => void) | null = null,
        parentGetSideEffect: (() => void) | null = null,
        childrenGetSideEffect: (() => void) | null = null) {
        super(nodeName, index, propertiesGetSideEffect, childPropertyChangedSideEffect);
        this.parentGetSideEffect = parentGetSideEffect;
        this.childrenGetSideEffect = childrenGetSideEffect;
        if (parent) {
            this._parent = new WeakRef<IDataPropertyParent>(parent);
        }
        else {
            // The else statement here is due to the ts compiler not figuring out that _parent was definitively assigned otherwise
            this._parent = null;
        }
    }

    protected parentGetSideEffect: (() => void) | null = null;
    protected childrenGetSideEffect: (() => void) | null = null;

    public readonly [ITreeDataNodeSymbol] = true;

    protected _parent: WeakRef<IDataPropertyParent> | null;
    public get parent(): IDataPropertyParent | null {
        this.parentGetSideEffect?.call(this);
        const parentRef: IDataPropertyParent | undefined | null = this._parent?.deref();
        if (parentRef) {
            return parentRef;
        }
        return null;
    }

    protected _children: IDataNode[] = [];
    public get children(): IDataNode[] {
        this.childrenGetSideEffect?.call(this);
        return this._children;
    }

    public override onChildPropertyChanged(source: IDataProperty<unknown> | null, propertyName: string | null, index: number | null, path: IDataNode[]): void {
        super.onChildPropertyChanged(source, propertyName, index, path);

        const parentRef: IDataPropertyParent | undefined | null = this._parent?.deref();
        if (parentRef) {
            parentRef.onChildPropertyChanged(source, propertyName, index, path);
        }
    }

    public override[Symbol.dispose](): void {
        for (let i: number = 0; i < this._children.length; i++) {
            this._children[i][Symbol.dispose]();
        }
        this._children = [];
        super[Symbol.dispose]();
        this._parent = null;
    }

    public override toString(): string {
        if (this._index === null) {
            return `BaseTreeDataNode(${this._nodeName})`;
        }
        else {
            return `BaseTreeDataNode(${this._nodeName}[${this._index}])`;
        }
    }
}