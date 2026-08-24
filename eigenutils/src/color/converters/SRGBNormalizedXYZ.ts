// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import { IReadonlyMatrix3x3 } from "../../math/IMatrix3x3";
import { normalizedSRGBToLinearRGBChannel, linearRGBToNormalizedSRGBChannel } from "./NormalizedSRGBLinearRGB";
import { IXYZ, XYZ } from "../IXYZ";
import { ISRGBNormalized, SRGBNormalized } from "../ISRGBNormalized";
import { IReadonlyVector3 } from "../../math/IVector3";
import { linearTransform } from "../../math/linearTransform";

// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html

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

// http://www.brucelindbloom.com/Eqn_RGB_to_XYZ.html
// This converts to XYZ using the D65 standard illuminant
export function srgbNormalizedToXYZ(rgb: ISRGBNormalized): IXYZ {
  // Convert from gamma corrected sRGB to linear RGB
  const linearR: number = normalizedSRGBToLinearRGBChannel(rgb.r);
  const linearG: number = normalizedSRGBToLinearRGBChannel(rgb.g);
  const linearB: number = normalizedSRGBToLinearRGBChannel(rgb.b);

  // linear transform to XYZ
  const transformed: IReadonlyVector3 = linearTransform(linearRGBToXYZD65, linearR, linearG, linearB);
  // return {
  //   [IXYZSymbol]: true,
  //   x: transformed.x,
  //   y: transformed.y,
  //   z: transformed.z
  // };
  return new XYZ(transformed.x, transformed.y, transformed.z);
}

// http://www.brucelindbloom.com/Eqn_XYZ_to_RGB.html
// This converts from XYZ using the D65 standard illuminant
export function xyzToSRGBNormalized(xyz: IXYZ): ISRGBNormalized {
  // Linear transform to linear RGB

  const linearRGB: IReadonlyVector3 = linearTransform(xyzD65ToLinearRGB, xyz.x, xyz.y, xyz.z);

  // Nonlinear gamma correction to convert to sRGB
  return new SRGBNormalized(
    linearRGBToNormalizedSRGBChannel(linearRGB.x),
    linearRGBToNormalizedSRGBChannel(linearRGB.y),
    linearRGBToNormalizedSRGBChannel(linearRGB.z)
  );
}
