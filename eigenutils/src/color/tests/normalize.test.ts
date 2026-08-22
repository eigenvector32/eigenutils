// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import * as rawColorDataNamed from "./colorData_named.json";
import {
  parseArray,
  IRawTestColorData,
  IRawTestColorDataItem
} from "./IRawTestColorData";
import {
  clampChannel,
  normalizeISRGB,
  denormalizeISRGBNormalized
} from "../normalize";
import { SRGB } from "../ISRGB";
import { SRGBNormalized } from "../ISRGBNormalized";

const colorData: IRawTestColorData = rawColorDataNamed;

const signifigantDigits: number = 10;

describe("Tests for formatColor", () => {
  test("Verify test data version", () => {
    expect(colorData.version).toBe("1.0.1");
  });

  test("clampChannel", () => {
    expect(clampChannel(300, null, null)).toBe(300);
    expect(clampChannel(300, null, 255)).toBe(255);
    expect(clampChannel(300, 301, null)).toBe(301);
    expect(clampChannel(300, 301, 255)).toBe(255);
  });

  test("normalize", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const srgb: number[] = parseArray(rawColor.rgb);

      const normalized: SRGBNormalized = normalizeISRGB(
        new SRGB(srgb[0], srgb[1], srgb[2])
      );

      const knownNormalized: number[] = parseArray(rawColor.rgbnormalized);
      expect(normalized.r).toBeCloseTo(knownNormalized[0], signifigantDigits);
      expect(normalized.g).toBeCloseTo(knownNormalized[1], signifigantDigits);
      expect(normalized.b).toBeCloseTo(knownNormalized[2], signifigantDigits);
    });
  });

  test("denormalize", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const normalized: number[] = parseArray(rawColor.rgbnormalized);

      const denormalized: SRGB = denormalizeISRGBNormalized(
        new SRGBNormalized(normalized[0], normalized[1], normalized[2])
      );

      const knownRGB: number[] = parseArray(rawColor.rgb);
      expect(denormalized.r).toBe(knownRGB[0]);
      expect(denormalized.g).toBe(knownRGB[1]);
      expect(denormalized.b).toBe(knownRGB[2]);
    });
  });
});
