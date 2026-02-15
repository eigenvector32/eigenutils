// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import * as rawColorDataNamed from "./colorData_named.json";
import { IRawTestColorData, IRawTestColorDataItem } from "./IRawTestColorData";
import { parseTriplet } from "./IRawTestColorData";
import { SRGB } from "../ISRGB";
import { SRGBNormalized } from "../ISRGBNormalized";
import { ISRGBToHex, ISRGBNormalizedToHex } from "../formatColor";

const colorData: IRawTestColorData = rawColorDataNamed;

describe('Tests for formatColor', () => {
    test('Verify test data version', () => {
        expect(colorData.version).toBe("1.0.0");
    });

    test('ISRGBToHex', () => {
        colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
            const color: SRGB = new SRGB(rawColor.r!, rawColor.g!, rawColor.b!);

            const formatted: string = ISRGBToHex(color);

            expect(formatted).toBe(rawColor.hex);
        });
    });

    test('ISRGBNormalizedToHex', () => {
        colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
            expect(rawColor.hex).toBeDefined();

            const srgbd65: number[] = parseTriplet(rawColor.srgbD65)
            const color: SRGBNormalized = new SRGBNormalized(srgbd65[0], srgbd65[1], srgbd65[2]);

            const formatted: string = ISRGBNormalizedToHex(color);

            expect(formatted).toBe(rawColor.hex);
        });
    });
});
