// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import * as rawColorDataNamed from "./colorData_named.json";
import { parseArray, IRawTestColorData, IRawTestColorDataItem } from "./IRawTestColorData";
import { XYZ, StandardIlluminant } from "../IXYZ";
import { LAB } from "../ILAB";
import { XYZToLAB, LABToXYZ } from "../converters/XYZLAB";

const colorData: IRawTestColorData = rawColorDataNamed;

const signifigantDigits: number = 5;

describe("Tests for XYZLAB", () => {
  test("Verify test data version", () => {
    expect(colorData.version).toBe("1.0.3");
  });

  test("XYZToLAB D65", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const rawXYZ: number[] = parseArray(rawColor.xyzd65);
      const xyz: XYZ = new XYZ(rawXYZ[0], rawXYZ[1], rawXYZ[2]);
      const lab: LAB = XYZToLAB(xyz, StandardIlluminant.D65);
      const knownLAB: number[] = parseArray(rawColor.labd65);
      expect(lab.l).toBeCloseTo(knownLAB[0], signifigantDigits);
      expect(lab.a).toBeCloseTo(knownLAB[1], signifigantDigits);
      expect(lab.b).toBeCloseTo(knownLAB[2], signifigantDigits);
    });
  });

  test("LABToXYZ D65", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const rawLAB: number[] = parseArray(rawColor.labd65);
      const lab: LAB = new LAB(rawLAB[0], rawLAB[1], rawLAB[2]);
      const xyz: XYZ = LABToXYZ(lab, StandardIlluminant.D65);
      const knownXYZ: number[] = parseArray(rawColor.xyzd65);
      expect(xyz.x).toBeCloseTo(knownXYZ[0], signifigantDigits);
      expect(xyz.y).toBeCloseTo(knownXYZ[1], signifigantDigits);
      expect(xyz.z).toBeCloseTo(knownXYZ[2], signifigantDigits);
    });
  });

  test("XYZToLAB D50", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const rawXYZ: number[] = parseArray(rawColor.xyzd50);
      const xyz: XYZ = new XYZ(rawXYZ[0], rawXYZ[1], rawXYZ[2]);
      const lab: LAB = XYZToLAB(xyz, StandardIlluminant.D50);
      const knownLAB: number[] = parseArray(rawColor.labd50);
      expect(lab.l).toBeCloseTo(knownLAB[0], signifigantDigits);
      expect(lab.a).toBeCloseTo(knownLAB[1], signifigantDigits);
      expect(lab.b).toBeCloseTo(knownLAB[2], signifigantDigits);
    });
  });

    test("LABToXYZ D50", () => {
    colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
      const rawLAB: number[] = parseArray(rawColor.labd50);
      const lab: LAB = new LAB(rawLAB[0], rawLAB[1], rawLAB[2]);
      const xyz: XYZ = LABToXYZ(lab, StandardIlluminant.D50);
      const knownXYZ: number[] = parseArray(rawColor.xyzd50);
      expect(xyz.x).toBeCloseTo(knownXYZ[0], signifigantDigits);
      expect(xyz.y).toBeCloseTo(knownXYZ[1], signifigantDigits);
      expect(xyz.z).toBeCloseTo(knownXYZ[2], signifigantDigits);
    });
  });
});
