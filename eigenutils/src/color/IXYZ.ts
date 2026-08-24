// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

export const IXYZSymbol: unique symbol = Symbol.for("eigenutils.color.IXYZ");

// Valid RGB colors require channels in the range [0,255].
// Values outside that range may exist when converting between spaces larger than RGB.
export interface IXYZ {
  [IXYZSymbol]: true;
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export function isIXYZ(input: any): input is IXYZ {
  if (input === null || input === undefined) {
    return false;
  }
  return input[IXYZSymbol] === true;
}

export class XYZ implements IXYZ {
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public toString(): string {
    return `XYZ(${this.x},${this.y},${this.z})`;
  }

  public readonly [IXYZSymbol] = true;

  public readonly x: number;
  public readonly y: number;
  public readonly z: number;
}
