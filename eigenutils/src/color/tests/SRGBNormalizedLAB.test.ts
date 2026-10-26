// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import * as rawColorDataNamed from "./colorData_named.json";
import { parseArray, IRawTestColorData, IRawTestColorDataItem } from "./IRawTestColorData";
import { LAB } from "../ILAB";
import { srgbNormalizedToLAB, labToSRGBNormalized } from "../converters/SRGBNormalizedLAB";
import { SRGBNormalized } from "../ISRGBNormalized";
import { StandardIlluminant } from "../IXYZ";

const colorData: IRawTestColorData = rawColorDataNamed;

const signifigantDigits: number = 4;

describe("Tests for SRGBNormlizedLAB", () => {
  test("Verify test data version", () => {
    expect(colorData.version).toBe("1.0.3");
  });

  test("srgbNormalizedToLAB D65", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const srgbNormalized: number[] = parseArray(rawColor.normalizedrgb);
      const lab: LAB = srgbNormalizedToLAB(new SRGBNormalized(srgbNormalized[0], srgbNormalized[1], srgbNormalized[2]), StandardIlluminant.D65);
      const knownLAB: number[] = parseArray(rawColor.labd65);
      expect(lab.l).toBeCloseTo(knownLAB[0], signifigantDigits);
      expect(lab.a).toBeCloseTo(knownLAB[1], signifigantDigits);
      expect(lab.b).toBeCloseTo(knownLAB[2], signifigantDigits);
    });
  });

  test("srgbNormalizedToLAB D50", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const srgbNormalized: number[] = parseArray(rawColor.normalizedrgb);
      const lab: LAB = srgbNormalizedToLAB(new SRGBNormalized(srgbNormalized[0], srgbNormalized[1], srgbNormalized[2]), StandardIlluminant.D50);
      const knownLAB: number[] = parseArray(rawColor.labd50);
      expect(lab.l).toBeCloseTo(knownLAB[0], signifigantDigits);
      expect(lab.a).toBeCloseTo(knownLAB[1], signifigantDigits);
      expect(lab.b).toBeCloseTo(knownLAB[2], signifigantDigits);
    });
  });

  test("labToSRGBNormalized D65", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const lab: number[] = parseArray(rawColor.labd65);
      const srgbNormalized: SRGBNormalized = labToSRGBNormalized(new LAB(lab[0], lab[1], lab[2]), StandardIlluminant.D65);
      const knownSRGBNormalized: number[] = parseArray(rawColor.normalizedrgb);
      expect(srgbNormalized.r).toBeCloseTo(knownSRGBNormalized[0], signifigantDigits);
      expect(srgbNormalized.g).toBeCloseTo(knownSRGBNormalized[1], signifigantDigits);
      expect(srgbNormalized.b).toBeCloseTo(knownSRGBNormalized[2], signifigantDigits);
    });
  });

  test("labToSRGBNormalized D50", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const lab: number[] = parseArray(rawColor.labd50);
      const srgbNormalized: SRGBNormalized = labToSRGBNormalized(new LAB(lab[0], lab[1], lab[2]), StandardIlluminant.D50);
      const knownSRGBNormalized: number[] = parseArray(rawColor.normalizedrgb);
      expect(srgbNormalized.r).toBeCloseTo(knownSRGBNormalized[0], signifigantDigits);
      expect(srgbNormalized.g).toBeCloseTo(knownSRGBNormalized[1], signifigantDigits);
      expect(srgbNormalized.b).toBeCloseTo(knownSRGBNormalized[2], signifigantDigits);
    });
  });
});
