// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import * as rawColorDataNamed from "./colorData_named.json";
import { parseArray, IRawTestColorData, IRawTestColorDataItem } from "./IRawTestColorData";
import { XYZ } from "../IXYZ";
import { xyzToTemperature } from "../converters/XYZTemperature";

const colorData: IRawTestColorData = rawColorDataNamed;

const signifigantDigits: number = 6;

describe("Tests for XYZTemperature", () => {
  test("Verify test data version", () => {
    expect(colorData.version).toBe("1.0.2");
  });

  test("xyzToTemperature", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const rawXYZ: number[] = parseArray(rawColor.xyzd65);
      const xyz: XYZ = new XYZ(rawXYZ[0], rawXYZ[1], rawXYZ[2]);
      const temperature: number = xyzToTemperature(xyz);

      const knownTemperature = Number(rawColor.temperature);

      console.log(`${xyz.x},${xyz.y},${xyz.z}  => ${temperature}   LAB: ${rawColor.labd65}`);
      expect(temperature).toBeCloseTo(knownTemperature, signifigantDigits);
    });
  });
});
