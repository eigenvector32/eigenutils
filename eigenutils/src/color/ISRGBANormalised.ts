// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license
import { ISRGBNormalized, ISRGBNormalizedSymbol } from "./ISRGBNormalized";

export const ISRGBANormalizedSymbol: unique symbol = Symbol.for(
  "eigenutils.color.ISRGBANormalized"
);

// Valid RGBA colors require channels in the range [0,1].
// Values outside that range may exist when converting between spaces larger than RGB.
export interface ISRGBANormalized extends ISRGBNormalized {
  [ISRGBANormalizedSymbol]: true;
  
  readonly a: number;
}

export function isISRGBANormalized(input: any): input is ISRGBANormalized {
  if (input === null || input === undefined) {
    return false;
  }
  return input[ISRGBANormalizedSymbol] === true;
}

export class SRGBANormalized implements ISRGBANormalized {
  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public toString(): string {
    return `SRGBANormalized(${this.r},${this.g},${this.b},${this.a})`;
  }

  public readonly [ISRGBNormalizedSymbol] = true;
  public readonly [ISRGBANormalizedSymbol] = true;

  public readonly r: number;
  public readonly g: number;
  public readonly b: number;
  public readonly a: number;
}
