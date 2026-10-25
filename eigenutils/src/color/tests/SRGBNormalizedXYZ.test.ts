// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import * as rawColorDataNamed from "./colorData_named.json";
import { parseArray, IRawTestColorData, IRawTestColorDataItem } from "./IRawTestColorData";
import { srgbNormalizedToXYZ, StandardIlluminant, xyzToSRGBNormalized } from "../converters/SRGBNormalizedXYZ";
import { IXYZ, XYZ } from "../IXYZ";
import { ISRGBNormalized, SRGBNormalized } from "../ISRGBNormalized";

const colorData: IRawTestColorData = rawColorDataNamed;

const signifigantDigits: number = 5;

describe("Tests for SRGBNormlizedXYZ", () => {
  test("Verify test data version", () => {
    expect(colorData.version).toBe("1.0.3");
  });

  test("srgbNormalizedToXYZ D65", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const srgbNormalized: number[] = parseArray(rawColor.normalizedrgb);
      const xyz: IXYZ = srgbNormalizedToXYZ(new SRGBNormalized(srgbNormalized[0], srgbNormalized[1], srgbNormalized[2]), StandardIlluminant.D65);
      const knownXYZ: number[] = parseArray(rawColor.xyzd65);
      expect(xyz.x).toBeCloseTo(knownXYZ[0], signifigantDigits);
      expect(xyz.y).toBeCloseTo(knownXYZ[1], signifigantDigits);
      expect(xyz.z).toBeCloseTo(knownXYZ[2], signifigantDigits);
    });
  });

  test("srgbNormalizedToXYZ D50", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const srgbNormalized: number[] = parseArray(rawColor.normalizedrgb);
      const xyz: IXYZ = srgbNormalizedToXYZ(new SRGBNormalized(srgbNormalized[0], srgbNormalized[1], srgbNormalized[2]), StandardIlluminant.D50);
      const knownXYZ: number[] = parseArray(rawColor.xyzd50);
      expect(xyz.x).toBeCloseTo(knownXYZ[0], signifigantDigits);
      expect(xyz.y).toBeCloseTo(knownXYZ[1], signifigantDigits);
      expect(xyz.z).toBeCloseTo(knownXYZ[2], signifigantDigits);
    });
  });

  test("xyzToSRGBNormalized D65", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const xyz: number[] = parseArray(rawColor.xyzd65);
      const srgbNormalized: ISRGBNormalized = xyzToSRGBNormalized(new XYZ(xyz[0], xyz[1], xyz[2]), StandardIlluminant.D65);
      const knownSRGBNormalized: number[] = parseArray(rawColor.normalizedrgb);
      expect(srgbNormalized.r).toBeCloseTo(knownSRGBNormalized[0], signifigantDigits);
      expect(srgbNormalized.g).toBeCloseTo(knownSRGBNormalized[1], signifigantDigits);
      expect(srgbNormalized.b).toBeCloseTo(knownSRGBNormalized[2], signifigantDigits);
    });
  });

  test("xyzToSRGBNormalized D50", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const xyz: number[] = parseArray(rawColor.xyzd50);
      const srgbNormalized: ISRGBNormalized = xyzToSRGBNormalized(new XYZ(xyz[0], xyz[1], xyz[2]), StandardIlluminant.D50);
      const knownSRGBNormalized: number[] = parseArray(rawColor.normalizedrgb);
      expect(srgbNormalized.r).toBeCloseTo(knownSRGBNormalized[0], signifigantDigits);
      expect(srgbNormalized.g).toBeCloseTo(knownSRGBNormalized[1], signifigantDigits);
      expect(srgbNormalized.b).toBeCloseTo(knownSRGBNormalized[2], signifigantDigits);
    });
  });
});
