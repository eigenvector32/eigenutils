// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { ISRGB, ISRGBSymbol } from "./ISRGB";

export const ISRGBASymbol: unique symbol = Symbol.for(
  "eigenutils.color.ISRGBA"
);

// Valid alpha channel values are in the range [0,255].
// Values outside that range may exist when converting between spaces larger than RGB.
export interface ISRGBA extends ISRGB {
  [ISRGBASymbol]: true;
  readonly a: number;
}

export function isISRGBA(input: any): input is ISRGBA {
  if (input === null || input === undefined) {
    return false;
  }
  return input[ISRGBASymbol] === true;
}

export class SRGBA implements ISRGBA {
  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public toString(): string {
    return `SRGBA(${this.r},${this.g},${this.b},${this.a})`;
  }

  public readonly [ISRGBSymbol] = true;
  public readonly [ISRGBASymbol] = true;

  public readonly r: number;
  public readonly g: number;
  public readonly b: number;
  public readonly a: number;
}
