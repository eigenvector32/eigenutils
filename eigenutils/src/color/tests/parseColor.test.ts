// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import * as rawColorDataNamed from "./colorData_named.json";
import {
  parseArray,
  IRawTestColorData,
  IRawTestColorDataItem
} from "./IRawTestColorData";
import { parseHexRGBToSRGB, parseHexRGBToSRGBNormalized } from "../parseColor";
import { SRGB } from "../ISRGB";
import { SRGBNormalized } from "../ISRGBNormalized";

const colorData: IRawTestColorData = rawColorDataNamed;

const signifigantDigits: number = 10;

describe("Tests for parseColor", () => {
  test("Verify test data version", () => {
    expect(colorData.version).toBe("1.0.1");
  });

  test("parseHexRGBToSRGB", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const parsed: SRGB = parseHexRGBToSRGB(rawColor.hexRGB);

      const knownRGB: number[] = parseArray(rawColor.rgb);
      expect(parsed.r).toBe(knownRGB[0]);
      expect(parsed.g).toBe(knownRGB[1]);
      expect(parsed.b).toBe(knownRGB[2]);
    });
  });

  test("parseHexRGBToSRGBNormalized", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const parsed: SRGBNormalized = parseHexRGBToSRGBNormalized(
        rawColor.hexRGB
      );

      const knownNormalized: number[] = parseArray(rawColor.rgbnormalized);
      expect(parsed.r).toBeCloseTo(knownNormalized[0], signifigantDigits);
      expect(parsed.g).toBeCloseTo(knownNormalized[1], signifigantDigits);
      expect(parsed.b).toBeCloseTo(knownNormalized[2], signifigantDigits);
    });
  });
});
