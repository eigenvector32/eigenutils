// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

// https://en.wikipedia.org/wiki/SRGB
// Valid RGB colors require channels in the range [0,255].
// Values outside that range may exist when converting between spaces larger than RGB.
export interface ISRGB {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export function isISRGB(input: any): input is ISRGB {
  if (input === null || input === undefined || typeof input.r !== "number" || typeof input.g !== "number" || typeof input.b !== "number") {
    return false;
  }
  return true;
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

  public readonly r: number;
  public readonly g: number;
  public readonly b: number;

  public clone(): SRGB {
    return SRGB.clone(this);
  }

  public equals(rhs: ISRGB): boolean {
    return SRGB.equals(this, rhs);
  }

  public static clone(input: ISRGB): SRGB {
    return new SRGB(input.r, input.g, input.b);
  }

  public static equals(lhs: ISRGB, rhs: ISRGB): boolean {
    return lhs.r === rhs.r && lhs.g === rhs.g && lhs.b === rhs.b;
  }
}
