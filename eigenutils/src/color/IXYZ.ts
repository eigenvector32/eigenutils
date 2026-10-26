// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

export enum StandardIlluminant {
  D65,
  D50
}

// https://en.wikipedia.org/wiki/CIE_1931_color_space
// Valid RGB colors require channels in the range [0,255].
// Values outside that range may exist when converting between spaces larger than RGB.
export interface IXYZ {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export function isIXYZ(input: any): input is IXYZ {
  if (input === null || input === undefined || typeof input.x !== "number" || typeof input.y !== "number" || typeof input.z !== "number") {
    return false;
  }
  return true;
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

  public readonly x: number;
  public readonly y: number;
  public readonly z: number;

  public clone(): XYZ {
    return XYZ.clone(this);
  }

  public equals(rhs: IXYZ): boolean {
    return XYZ.equals(this, rhs);
  }

  public static clone(input: IXYZ): XYZ {
    return new XYZ(input.x, input.y, input.z);
  }

  public static equals(lhs: IXYZ, rhs: IXYZ): boolean {
    return lhs.x === rhs.x && lhs.y === rhs.y && lhs.z === rhs.z;
  }
}

export const referenceWhiteD65: XYZ = new XYZ(0.95047, 1, 1.08883);
export const referenceWhiteD50: XYZ = new XYZ(0.96422, 1, 0.82521);

export function getReferenceWhite(illuminant: StandardIlluminant): XYZ {
  switch (illuminant) {
    case StandardIlluminant.D65:
      return referenceWhiteD65;
    case StandardIlluminant.D50:
      return referenceWhiteD50;
    default:
      throw new Error(`Unknown standard illuminant ${illuminant}`);
  }
}
