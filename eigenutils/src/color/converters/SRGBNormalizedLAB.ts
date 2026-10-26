import { ILAB, LAB } from "../ILAB";
import { StandardIlluminant, XYZ } from "../IXYZ";
import { labToXYZ, xyzToLAB } from "./XYZLAB";
import { srgbNormalizedToXYZ, xyzToSRGBNormalized } from "./SRGBNormalizedXYZ";
import { ISRGBNormalized, SRGBNormalized } from "../ISRGBNormalized";

export function srgbNormalizedToLAB(rgb: ISRGBNormalized, illuminant: StandardIlluminant = StandardIlluminant.D65): LAB {
  const xyz: XYZ = srgbNormalizedToXYZ(rgb, illuminant);
  return xyzToLAB(xyz, illuminant);
}

export function labToSRGBNormalized(lab: ILAB, illuminant: StandardIlluminant = StandardIlluminant.D65): SRGBNormalized {
  const xyz: XYZ = labToXYZ(lab, illuminant);
  return xyzToSRGBNormalized(xyz, illuminant);
}
