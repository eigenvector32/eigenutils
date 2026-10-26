// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

// https://en.wikipedia.org/wiki/CIELAB_color_space
// Valid RGB colors require channels in the range [0,255].
// Values outside that range may exist when converting between spaces larger than RGB.
export interface ILAB {
  readonly l: number;
  readonly a: number;
  readonly b: number;
}

export function isILAB(input: any): input is ILAB {
  if (input === null || input === undefined || typeof input.l !== "number" || typeof input.a !== "number" || typeof input.b !== "number") {
    return false;
  }
  return true;
}

export class LAB implements ILAB {
  constructor(l: number, a: number, b: number) {
    this.l = l;
    this.a = a;
    this.b = b;
  }

  public toString(): string {
    return `LAB(${this.l},${this.a},${this.b})`;
  }

  public readonly l: number;
  public readonly a: number;
  public readonly b: number;

  public clone(): LAB {
    return LAB.clone(this);
  }

  public equals(rhs: ILAB): boolean {
    return LAB.equals(this, rhs);
  }

  public static clone(input: ILAB): LAB {
    return new LAB(input.l, input.a, input.b);
  }

  public static equals(lhs: ILAB, rhs: ILAB): boolean {
    return lhs.l === rhs.l && lhs.a === rhs.a && lhs.b === rhs.b;
  }
}
