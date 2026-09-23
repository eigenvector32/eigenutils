// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { ISRGB } from "./ISRGB";

// Valid alpha channel values are in the range [0,255].
// Values outside that range may exist when converting between spaces larger than RGB.
export interface ISRGBA extends ISRGB {
  readonly a: number;
}

export function isISRGBA(input: any): input is ISRGBA {
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

  public readonly r: number;
  public readonly g: number;
  public readonly b: number;
  public readonly a: number;

  public clone(): SRGBA {
    return SRGBA.clone(this);
  }

  public equals(rhs: ISRGBA): boolean {
    return SRGBA.equals(this, rhs);
  }

  public static clone(input: ISRGBA): SRGBA {
    return new SRGBA(input.r, input.g, input.b, input.a);
  }

  public static equals(lhs: ISRGBA, rhs: ISRGBA): boolean {
    return lhs.r === rhs.r && lhs.g === rhs.g && lhs.b === rhs.b && lhs.a === rhs.a;
  }
}
