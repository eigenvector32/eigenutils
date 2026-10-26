// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { ILAB, LAB } from "../ILAB";
import { IXYZ, XYZ, StandardIlluminant, getReferenceWhite } from "../IXYZ";

export const epsilon: number = 216 / 24389;
export const kappa: number = 24389 / 27;

function transformChannelXYZToLAB(i: number): number {
  if (i > epsilon) {
    return Math.cbrt(i);
  } else {
    return (kappa * i + 16) / 116;
  }
}

// http://www.brucelindbloom.com/index.html?Eqn_XYZ_to_Lab.html
export function XYZToLAB(xyz: IXYZ, illuminant: StandardIlluminant = StandardIlluminant.D65): LAB {
  const refWhite: XYZ = getReferenceWhite(illuminant);
  const xr: number = xyz.x / refWhite.x;
  const yr: number = xyz.y / refWhite.y;
  const zr: number = xyz.z / refWhite.z;
  const fx: number = transformChannelXYZToLAB(xr);
  const fy: number = transformChannelXYZToLAB(yr);
  const fz: number = transformChannelXYZToLAB(zr);
  return new LAB(116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz));
}

function transformChannelXZLABToXYZ(i: number): number {
  const icubed: number = Math.pow(i, 3);
  if (icubed > epsilon) {
    return icubed;
  } else {
    return (116 * i - 16) / kappa;
  }
}

function transformChannelYLABToXYZ(l: number): number {
  if (l > kappa * epsilon) {
    return Math.pow((l + 16) / 116, 3);
  } else {
    return l / kappa;
  }
}

// http://www.brucelindbloom.com/index.html?Eqn_XYZ_to_Lab.html
export function LABToXYZ(lab: ILAB, illuminant: StandardIlluminant = StandardIlluminant.D65): XYZ {
  const fy: number = (lab.l + 16) / 116;
  const fz: number = fy - lab.b / 200;
  const fx: number = lab.a / 500 + fy;
  const xr: number = transformChannelXZLABToXYZ(fx);
  const yr: number = transformChannelYLABToXYZ(lab.l);
  const zr: number = transformChannelXZLABToXYZ(fz);
  const refWhite: XYZ = getReferenceWhite(illuminant);
  return new XYZ(xr * refWhite.x, yr * refWhite.y, zr * refWhite.z);
}
