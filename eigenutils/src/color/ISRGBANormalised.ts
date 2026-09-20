// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license
import { ISRGBNormalized } from "./ISRGBNormalized";

// Valid RGBA colors require channels in the range [0,1].
// Values outside that range may exist when converting between spaces larger than RGB.
export interface ISRGBANormalized extends ISRGBNormalized {
  readonly a: number;
}

export function isISRGBANormalized(input: any): input is ISRGBANormalized {
  if (
    input === null ||
    input === undefined ||
    typeof input.r !== "number" ||
    typeof input.g !== "number" ||
    typeof input.b !== "number" ||
    typeof input.a !== "number"
  ) {
    return false;
  }
  return true;
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

  public readonly r: number;
  public readonly g: number;
  public readonly b: number;
  public readonly a: number;

  public static clone(input: ISRGBANormalized): SRGBANormalized {
    return new SRGBANormalized(input.r, input.g, input.b, input.a);
  }
}
