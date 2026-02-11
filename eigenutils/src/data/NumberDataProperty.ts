import { BaseDataProperty, IDataPropertyParent } from "./IDataProperty";

export class NumberDataProperty extends BaseDataProperty<number> {
    constructor(value: number,
        minValue: number | null = null,
        maxValue: number | null = null,
        nodeName: string | null = null,
        index: number | null = null,
        parent: IDataPropertyParent | null = null,
        valueChangedSideEffect: (() => void) | null = null,
        valueGetSideEffect: (() => void) | null = null,
        validateImpl: (() => void) | null = null,
        isValidChangedSideEffect: (() => void) | null = null,
        isValidGetSideEffect: (() => void) | null = null) {
        super(value, nodeName, index, parent);

        this.valueChangedSideEffect = valueChangedSideEffect;
        this.valueGetSideEffect = valueGetSideEffect;
        this.validateImpl = validateImpl;
        this.isValidChangedSideEffect = isValidChangedSideEffect;
        this.isValidGetSideEffect = isValidGetSideEffect;

        if (this.validateImpl === null) {
            this.validateImpl = this.validateNumber;
        }

        this._minValue = minValue;
        this._maxValue = maxValue;

        this.validate(false);
    }

    protected _minValue: number | null;
    public get minValue(): number | null {
        return this._minValue;
    }

    protected _maxValue: number | null;
    public get maxValue(): number | null {
        return this._maxValue;
    }

    public throwOnInvalidValue: boolean = false;
    public clampValue: boolean = false;

    protected validateNumber(): void {
        if (this.clampValue) {
            if (this._minValue !== null && this._value < this._minValue) {
                this._value = this._minValue;
            }
            if (this._maxValue !== null && this._value > this._maxValue) {
                this._value = this._maxValue;
            }
        }
        else {
            if (this._minValue !== null && this._value < this._minValue) {
                if (this.throwOnInvalidValue) {
                    throw new Error(`value ${this._value} is less than minValue ${this._minValue}`);
                }
                this._isValid = false;
                return;
            }
            if (this._maxValue !== null && this._value > this._maxValue) {
                if (this.throwOnInvalidValue) {
                    throw new Error(`value ${this._value} is more than maxValue ${this._maxValue}`);
                }
                this._isValid = false;
                return;
            }
        }
        this._isValid = true;
    }

    public override toString(): string {
        if (this._index === null) {
            return `NumberDataProperty(${this._nodeName}, ${this._value})`;
        }
        else {
            return `NumberDataProperty(${this._nodeName}[${this._index}], ${this._value})`;
        }
    }
}