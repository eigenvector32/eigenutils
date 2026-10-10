// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import * as rawColorDataNamed from "./colorData_named.json";
import { parseArray, IRawTestColorData, IRawTestColorDataItem } from "./IRawTestColorData";
import { parseHexRGBToSRGB, parseHexRGBToSRGBNormalized } from "../parseColor";
import { SRGB } from "../ISRGB";
import { SRGBNormalized } from "../ISRGBNormalized";

const colorData: IRawTestColorData = rawColorDataNamed;

const signifigantDigits: number = 8;

describe("Tests for parseColor", () => {
  test("Verify test data version", () => {
    expect(colorData.version).toBe("1.0.3");
  });

  test("parseHexRGBToSRGB", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      if (rawColor.hexrgb === undefined) {
        throw new Error("Test data missing hexrgb");
      }
      const parsed: SRGB = parseHexRGBToSRGB(rawColor.hexrgb);

      const knownRGB: number[] = parseArray(rawColor.rgb);
      expect(parsed.r).toBe(knownRGB[0]);
      expect(parsed.g).toBe(knownRGB[1]);
      expect(parsed.b).toBe(knownRGB[2]);
    });
  });

  test("parseHexRGBToSRGBNormalized", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      if (rawColor.hexrgb === undefined) {
        throw new Error("Test data missing hexrgb");
      }
      const parsed: SRGBNormalized = parseHexRGBToSRGBNormalized(rawColor.hexrgb);

      const knownNormalized: number[] = parseArray(rawColor.normalizedrgb);
      expect(parsed.r).toBeCloseTo(knownNormalized[0], signifigantDigits);
      expect(parsed.g).toBeCloseTo(knownNormalized[1], signifigantDigits);
      expect(parsed.b).toBeCloseTo(knownNormalized[2], signifigantDigits);
    });
  });
});
