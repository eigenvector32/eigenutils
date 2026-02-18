// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

export const ISRGBSymbol: unique symbol = Symbol.for("eigenutils.color.ISRGB");

// Valid RGB colors require channels in the range [0,255]. 
// Values outside that range may exist when converting between spaces larger than RGB.
export interface ISRGB {
    [ISRGBSymbol]: true;
    readonly r: number;
    readonly g: number;
    readonly b: number;
}

export function isISRGB(input: any): input is ISRGB {
    if (input === null || input === undefined) {
        return false;
    }
    return input[ISRGBSymbol] === true;
}

export class SRGB implements ISRGB {
    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    public toString(): string {
        return `SRGB(${this.r},${this.g},${this.b})`;
    }

    public readonly [ISRGBSymbol] = true;

    public readonly r: number;
    public readonly g: number;
    public readonly b: number;
}