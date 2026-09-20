// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

// Valid RGB colors require channels in the range [0,1].
// Values outside that range may exist when converting between spaces larger than RGB.
export interface ISRGBNormalized {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export function isISRGBNormalized(input: any): input is ISRGBNormalized {
  if (input === null || input === undefined || typeof input.r !== "number" || typeof input.g !== "number" || typeof input.b !== "number") {
    return false;
  }
  return true;
}

export class SRGBNormalized implements ISRGBNormalized {
  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  public toString(): string {
    return `SRGBNormalized(${this.r},${this.g},${this.b})`;
  }

  public readonly r: number;
  public readonly g: number;
  public readonly b: number;

  public static clone(input: ISRGBNormalized): SRGBNormalized {
    return new SRGBNormalized(input.r, input.g, input.b);
  }
}
