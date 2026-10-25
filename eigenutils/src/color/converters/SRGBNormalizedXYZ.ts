// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IReadonlyMatrix3x3 } from "../../math/IMatrix3x3";
import { normalizedSRGBToLinearRGBChannel, linearRGBToNormalizedSRGBChannel } from "./NormalizedSRGBLinearRGB";
import { IXYZ, XYZ } from "../IXYZ";
import { ISRGBNormalized, SRGBNormalized } from "../ISRGBNormalized";
import { IReadonlyVector3 } from "../../math/IVector3";
import { linearTransform } from "../../math/linearTransform";

// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html

export enum StandardIlluminant {
  D65,
  D50
}

// linear rgb to CIEXYZ with D65 standard illuminant
export const linearRGBToXYZD65: IReadonlyMatrix3x3 = {
  m11: 0.4124564,
  m12: 0.3575761,
  m13: 0.1804375,
  m21: 0.2126729,
  m22: 0.7151522,
  m23: 0.072175,
  m31: 0.0193339,
  m32: 0.119192,
  m33: 0.9503041
};

// linear rgb to CIEXYZ with D50 standard illuminant
export const linearRGBToXYZD50: IReadonlyMatrix3x3 = {
  m11: 0.4360747,
  m12: 0.3850649,
  m13: 0.1430804,
  m21: 0.2225045,
  m22: 0.7168786,
  m23: 0.0606169,
  m31: 0.0139322,
  m32: 0.0971045,
  m33: 0.7141733
};

export function getRGBToXYZTransform(illuminant: StandardIlluminant): IReadonlyMatrix3x3 {
  switch (illuminant) {
    case StandardIlluminant.D65:
      return linearRGBToXYZD65;
    case StandardIlluminant.D50:
      return linearRGBToXYZD50;
    default:
      throw new Error(`Unknown standard illuminant ${illuminant}`);
  }
}

// CIEXYZ to linear rgb with D65 standard illuminant
export const xyzD65ToLinearRGB: IReadonlyMatrix3x3 = {
  m11: 3.2404542,
  m12: -1.5371385,
  m13: -0.4985314,
  m21: -0.969266,
  m22: 1.8760108,
  m23: 0.041556,
  m31: 0.0556434,
  m32: -0.2040259,
  m33: 1.0572252
};

// CIEXYZ to linear rgb with D50 standard illuminant
export const xyzD50ToLinearRGB: IReadonlyMatrix3x3 = {
  m11: 3.1338561,
  m12: -1.6168667,
  m13: -0.4906146,
  m21: -0.9787684,
  m22: 1.9161415,
  m23: 0.033454,
  m31: 0.0719453,
  m32: -0.2289914,
  m33: 1.4052427
};

export function getXYZToRGBTransform(illuminant: StandardIlluminant): IReadonlyMatrix3x3 {
  switch (illuminant) {
    case StandardIlluminant.D65:
      return xyzD65ToLinearRGB;
    case StandardIlluminant.D50:
      return xyzD50ToLinearRGB;
    default:
      throw new Error(`Unknown standard illuminant ${illuminant}`);
  }
}

// http://www.brucelindbloom.com/Eqn_RGB_to_XYZ.html
// This converts to XYZ using the D65 standard illuminant
export function srgbNormalizedToXYZ(rgb: ISRGBNormalized, illuminant: StandardIlluminant = StandardIlluminant.D65): IXYZ {
  // Convert from gamma corrected sRGB to linear RGB
  const linearR: number = normalizedSRGBToLinearRGBChannel(rgb.r);
  const linearG: number = normalizedSRGBToLinearRGBChannel(rgb.g);
  const linearB: number = normalizedSRGBToLinearRGBChannel(rgb.b);

  // linear transform to XYZ
  const transformed: IReadonlyVector3 = linearTransform(getRGBToXYZTransform(illuminant), linearR, linearG, linearB);
  return new XYZ(transformed.x, transformed.y, transformed.z);
}

// http://www.brucelindbloom.com/Eqn_XYZ_to_RGB.html
// This converts from XYZ using the D65 standard illuminant
export function xyzToSRGBNormalized(xyz: IXYZ, illuminant: StandardIlluminant = StandardIlluminant.D65): ISRGBNormalized {
  // Linear transform to linear RGB

  const linearRGB: IReadonlyVector3 = linearTransform(getXYZToRGBTransform(illuminant), xyz.x, xyz.y, xyz.z);

  // Nonlinear gamma correction to convert to sRGB
  return new SRGBNormalized(
    linearRGBToNormalizedSRGBChannel(linearRGB.x),
    linearRGBToNormalizedSRGBChannel(linearRGB.y),
    linearRGBToNormalizedSRGBChannel(linearRGB.z)
  );
}
