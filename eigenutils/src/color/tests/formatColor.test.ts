// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import * as rawColorDataNamed from "./colorData_named.json";
import { IRawTestColorData, IRawTestColorDataItem } from "./IRawTestColorData";
import { parseArray } from "./IRawTestColorData";
import { SRGB } from "../ISRGB";
import { SRGBNormalized } from "../ISRGBNormalized";
import { ISRGBToHex, ISRGBNormalizedToHex } from "../formatColor";

const colorData: IRawTestColorData = rawColorDataNamed;

describe("Tests for formatColor", () => {
  test("Verify test data version", () => {
    expect(colorData.version).toBe("1.0.1");
  });

  test("ISRGBToHex", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const rgb: number[] = parseArray(rawColor.rgb);
      const color: SRGB = new SRGB(rgb[0], rgb[1], rgb[2]);

      const formatted: string = ISRGBToHex(color);

      expect(formatted).toBe(rawColor.hexRGB);
    });
  });

  test("ISRGBNormalizedToHex", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const srgb: number[] = parseArray(rawColor.rgbnormalized);
      const color: SRGBNormalized = new SRGBNormalized(
        srgb[0],
        srgb[1],
        srgb[2]
      );

      const formatted: string = ISRGBNormalizedToHex(color);

      expect(formatted).toBe(rawColor.hexRGB);
    });
  });
});
