// Copyright (c) 2026 Matthew Owen
// Distributed under MIT license

import * as rawColorDataNamed from "./colorData_named.json";
import { parseTriplet, IRawTestColorData, IRawTestColorDataItem } from "./IRawTestColorData";
import { parseHexRGBToSRGB, parseHexRGBToSRGBNormalized } from "../parseColor";
import { SRGB } from "../ISRGB";
import { SRGBNormalized } from "../ISRGBNormalized";

const colorData: IRawTestColorData = rawColorDataNamed;

const signifigantDigits: number = 10;

describe('Tests for parseColor', () => {
    test('Verify test data version', () => {
        expect(colorData.version).toBe("1.0.0");
    });

    test('parseHexRGBToSRGB', () => {
        colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
            const parsed: SRGB = parseHexRGBToSRGB(rawColor.hex!);

            expect(parsed.r).toBe(rawColor.r);
            expect(parsed.g).toBe(rawColor.g);
            expect(parsed.b).toBe(rawColor.b);
        });
    });

    test('parseHexRGBToSRGBNormalized', () => {
        colorData.data.forEach((rawColor: IRawTestColorDataItem) => {
            const srgbd65: number[] = parseTriplet(rawColor.srgbD65)

            const parsed: SRGBNormalized = parseHexRGBToSRGBNormalized(rawColor.hex!);

            expect(parsed.r).toBeCloseTo(srgbd65[0], signifigantDigits);
            expect(parsed.g).toBeCloseTo(srgbd65[1], signifigantDigits);
            expect(parsed.b).toBeCloseTo(srgbd65[2], signifigantDigits);
        });
    });
});
