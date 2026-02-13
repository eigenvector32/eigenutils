// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

export const ISRGBNormalizedSymbol: unique symbol = Symbol.for("eigenutils.color.ISRGBNormalized");

// Valid RGB colors require channels in the range [0,1]. 
// Values outside that range may exist when converting between spaces larger than RGB.
export interface ISRGBNormalized {
    [ISRGBNormalizedSymbol]: true;
    readonly r: number;
    readonly g: number;
    readonly b: number;
}

export function isISRGBNormalized(input: any): input is ISRGBNormalized {
    if (input === null || input === undefined) {
        return false;
    }
    return input[ISRGBNormalizedSymbol] === true;
}

export class SRGBNormalized implements ISRGBNormalized {
    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    public readonly [ISRGBNormalizedSymbol] = true;

    public readonly r: number;
    public readonly g: number;
    public readonly b: number;

    public toString(): string {
        return `SRGBNormalized(${this.r},${this.g},${this.b})`;
    }
}